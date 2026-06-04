import { nanoid } from "nanoid";
import { EventEmitter } from "node:events";
import { AddClient, GetClients } from "./database";
import type { Message } from "./types";

const DefaultChannel = "default";

const sseEvents = new EventEmitter();
sseEvents.setMaxListeners(0); // allow unlimited listeners

const pollClientCount = async () => {
  const [clientHistory] = await Promise.all([GetClients(6)]);
  sseEvents.emit("message", {
    channel: "stats",
    event: "message",
    data: {
      active_clients: sseEvents.listenerCount("message"),
      activity: clientHistory.map((entry) => ({
        timestamp: entry.date_time,
        clients: entry.client_count,
      })),
    },
  });
};

setInterval(pollClientCount, 5 * 1000);

const emitMessage = async (message: Message) => {
  sseEvents.emit("message", message);
  // AddMessageCount();
};

const sendMessage = (
  ctrl: Bun.ReadableStreamController<any>,
  channelId: string,
  message: Message,
) => {
  if (message.channel === channelId || message.channel === DefaultChannel) {
    let msgBody;
    if (typeof message.data === "object") {
      msgBody = JSON.stringify(message.data);
    } else {
      msgBody = String(message.data);
    }

    ctrl.enqueue(
      `id: ${nanoid()}\nevent: ${message.event}\ndata: ${msgBody}\nretry: 1000\n\n`,
    );
  }
};

// Keep sending heartbeat every 5 seconds to prevent timeouts
setInterval(() => {
  sseEvents.emit("message", {
    channel: DefaultChannel,
    data: {
      timestamp: new Date().toISOString(),
    },
    event: "keep-alive",
  });
}, 5000);

// CountClients every second
setInterval(() => AddClient(sseEvents.listenerCount("message")), 1000);

function subcribeToChannel(channelId: string, req: Bun.BunRequest) {
  let messageListener: (msg: Message) => void;

  const stream = new ReadableStream({
    start(ctrl) {
      console.log(`Client subscribed to channel: ${channelId}`);

      // Send welcome message on first connection
      sendMessage(ctrl, channelId, {
        channel: channelId,
        data: {
          timestamp: new Date().toISOString(),
        },
        event: "welcome",
      });

      // Create and store the listener for this specific connection
      messageListener = (msg: Message) => {
        sendMessage(ctrl, channelId, msg);
      };

      sseEvents.on("message", messageListener);
    },
    cancel() {
      console.log(`Client unsubscribed from channel: ${channelId}`);

      // Only remove this connection's listener, not all listeners
      if (messageListener) {
        sseEvents.off("message", messageListener);
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "text/event-stream;charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

export { emitMessage, sseEvents, subcribeToChannel };
