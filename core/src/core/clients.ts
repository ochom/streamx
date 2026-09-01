import { nanoid } from "nanoid";
import { subscribe } from "./redisClient";
import type { Message, SseEvent } from "./types";

const CLIENT_KEEP_ALIVE_INTERVAL = 5 * 1_000; // 5 seconds
const MaxBlockedWrites = Number(process.env.PUBSUB_MAX_BLOCKED_WRITES ?? 10);

const sendMessage = (
  ctrl: Bun.ReadableStreamController<any>,
  message: SseEvent,
) => {
  try {
    if (ctrl.desiredSize !== null && ctrl.desiredSize <= 0) {
      return false;
    }

    let msgBody;
    if (typeof message.data === "object") {
      msgBody = JSON.stringify(message.data);
    } else {
      msgBody = String(message.data);
    }

    ctrl.enqueue(
      `id: ${nanoid(5)}\nevent: ${message.event}\ndata: ${msgBody}\nretry: 1000\n\n`,
    );
    return true;
  } catch (e) {
    return false;
  }
};

function subcribeToChannel(channelId: string, allowOrigin = "*") {
  let messageListener: ((msg: Message) => void) | undefined;
  let cleaned = false;
  let blockedWrites = 0;

  const cleanup = () => {
    if (cleaned) {
      return;
    }

    cleaned = true;
    if (messageListener) {
      messageListener = undefined;
    }

    console.log(`Client unsubscribed from channel: ${channelId}`);
  };

  const stream = new ReadableStream({
    start(ctrl) {
      console.log(`Client subscribed to channel: ${channelId}`);

      // Send welcome message on first connection
      const welcomeSent = sendMessage(ctrl, {
        data: "",
        event: "welcome",
      });

      if (!welcomeSent) {
        cleanup();
        ctrl.close();
        return;
      }

      // Create and store the listener for this specific connection
      messageListener = (msg: SseEvent) => {
        const sent = sendMessage(ctrl, msg);
        if (sent) {
          blockedWrites = 0;
          return;
        }

        blockedWrites += 1;
        if (blockedWrites >= MaxBlockedWrites) {
          console.warn(
            `Max blocked writes reached for channel ${channelId}. Closing connection.`,
          );
          cleanup();
          ctrl.close();
        }
      };

      setInterval(
        () =>
          sendMessage(ctrl, {
            data: "",
            event: "tudu",
          }),
        10_000,
      );

      subscribe(channelId, (msg: string) => {
        messageListener?.(JSON.parse(msg));
      });
    },
    cancel() {
      console.log(`Client connection cancelled for channel: ${channelId}`);
      cleanup();
    },
  });

  const headers = new Headers({
    "Access-Control-Allow-Origin": allowOrigin,
    "Content-Type": "text/event-stream;charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  if (allowOrigin !== "*") {
    headers.set("Vary", "Origin");
  }

  return new Response(stream, {
    status: 200,
    headers,
  });
}

export { subcribeToChannel };
