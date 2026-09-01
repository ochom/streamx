import { nanoid } from "nanoid";
import { EventEmitter } from "node:events";
import {
  AddMessageCount,
  CountMessages,
  GetClients,
  GetMessageActivity,
  UpdateClientCount,
} from "./database";
import type { Message } from "./types";

const CLIENT_KEEP_ALIVE_INTERVAL = 5 * 1_000; // 5 seconds
const DefaultChannel = "default";
const MaxBlockedWrites = Number(process.env.PUBSUB_MAX_BLOCKED_WRITES ?? 10);

const sseEvents = new EventEmitter();
// Keep listener warnings enabled unless explicitly overridden.
const maxListeners = Number(process.env.PUBSUB_MAX_LISTENERS ?? 1000);
if (!Number.isNaN(maxListeners) && maxListeners > 0) {
  sseEvents.setMaxListeners(maxListeners);
}

const pollClientCount = async () => {
  const [
    clientHistory,
    messageActivity,
    messagesLastHour,
    messagesLast24Hours,
  ] = await Promise.all([
    GetClients(6),
    GetMessageActivity(6),
    CountMessages(1),
    CountMessages(24),
  ]);

  const clients = clientHistory.map((entry) => entry.client_count);
  const messageCounts = messageActivity.map((entry) => entry.message_count);
  const peakClients = clients.length > 0 ? Math.max(...clients) : 0;
  const avgClients =
    clients.length > 0
      ? Number(
          (clients.reduce((sum, val) => sum + val, 0) / clients.length).toFixed(
            2,
          ),
        )
      : 0;
  const peakMessagesPerMinute =
    messageCounts.length > 0 ? Math.max(...messageCounts) : 0;
  const totalMessages6h = messageCounts.reduce((sum, count) => sum + count, 0);

  sseEvents.emit("message", {
    channel: "stats",
    event: "message",
    data: {
      active_clients: sseEvents.listenerCount("message"),
      activity: clientHistory.map((entry) => ({
        timestamp: entry.date_time,
        clients: entry.client_count,
      })),
      message_activity: messageActivity.map((entry) => ({
        timestamp: entry.date_time,
        messages: entry.message_count,
      })),
      summary: {
        peak_clients_6h: peakClients,
        avg_clients_6h: avgClients,
        messages_last_hour: messagesLastHour,
        messages_last_24h: messagesLast24Hours,
        peak_messages_per_minute_6h: peakMessagesPerMinute,
        total_messages_6h: totalMessages6h,
      },
      received_at: new Date().toISOString(),
    },
  });
};

setInterval(pollClientCount, 5 * 1000);

const emitMessage = async (message: Message) => {
  await AddMessageCount();
  sseEvents.emit("message", message);
};

const sendMessage = (
  ctrl: Bun.ReadableStreamController<any>,
  channelId: string,
  message: Message,
) => {
  if (message.channel !== channelId && message.channel !== DefaultChannel) {
    return true; // Not intended for this channel, but not blocked either
  }

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
};

// Keep sending heartbeat every 5 seconds to prevent timeouts
setInterval(() => {
  sseEvents.emit("message", {
    channel: DefaultChannel,
    data: {},
    event: "keep-alive",
  });
}, CLIENT_KEEP_ALIVE_INTERVAL);

// UpdateClientCount every second
setInterval(() => UpdateClientCount(sseEvents.listenerCount("message")), 1000);

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
      sseEvents.off("message", messageListener);
      messageListener = undefined;
    }

    console.log(`Client unsubscribed from channel: ${channelId}`);
  };

  const stream = new ReadableStream({
    start(ctrl) {
      console.log(`Client subscribed to channel: ${channelId}`);

      // Send welcome message on first connection
      const welcomeSent = sendMessage(ctrl, channelId, {
        channel: channelId,
        data: {
          timestamp: new Date().toISOString(),
        },
        event: "welcome",
      });

      if (!welcomeSent) {
        cleanup();
        ctrl.close();
        return;
      }

      // Create and store the listener for this specific connection
      messageListener = (msg: Message) => {
        const sent = sendMessage(ctrl, channelId, msg);
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

      sseEvents.on("message", messageListener);
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

export { emitMessage, sseEvents, subcribeToChannel };
