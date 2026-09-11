export type Subscriber = (message: string) => void;

const channels = new Map<string, Set<Subscriber>>();

export function subscribe(channel: string, subscriber: Subscriber) {
  let subscribers = channels.get(channel);

  if (!subscribers) {
    subscribers = new Set();
    channels.set(channel, subscribers);
  }

  subscribers.add(subscriber);

  return () => {
    subscribers!.delete(subscriber);

    if (subscribers!.size === 0) {
      channels.delete(channel);
    }
  };
}

export async function publish(channel: string, message: string) {
  const subscribers = channels.get(channel);

  if (!subscribers) {
    return;
  }

  for (const subscriber of subscribers) {
    subscriber(message);
  }
}

const server = Bun.serve({
  port: 3000,

  async fetch(req) {
    const url = new URL(req.url);

    // POST /publish/:channel
    if (req.method === "POST" && url.pathname.startsWith("/publish/")) {
      const channel = decodeURIComponent(
        url.pathname.slice("/publish/".length),
      );

      const message = await req.text();

      publish(channel, message);

      return Response.json({
        success: true,
        channel,
      });
    }

    // GET /subscribe/:channel
    if (req.method === "GET" && url.pathname.startsWith("/subscribe/")) {
      const channel = decodeURIComponent(
        url.pathname.slice("/subscribe/".length),
      );

      const stream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();

          const send = (message: string) => {
            controller.enqueue(encoder.encode(`data: ${message}\n\n`));
          };

          // Keep connection alive
          const heartbeat = setInterval(() => {
            controller.enqueue(encoder.encode(": heartbeat\n\n"));
          }, 15_000);

          const unsubscribe = subscribe(channel, send);

          // Initial connection event
          send(
            JSON.stringify({
              type: "connected",
              channel,
            }),
          );

          // Detect client disconnect
          req.signal.addEventListener("abort", () => {
            clearInterval(heartbeat);
            unsubscribe();

            try {
              controller.close();
            } catch {}
          });
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    return new Response("Not found", { status: 404 });
  },
});
