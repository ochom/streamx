import { RedisClient } from "bun";
import type { SseEvent } from "./types";

// init redis client
const redisClient = new RedisClient(process.env.REDIS_URL);
await redisClient.connect();

export const subscribe = async (
  channel: string,
  callback: (message: string) => void,
) => {
  try {
    const subscriber = await redisClient.duplicate();
    await subscriber.subscribe(channel, (message) => {
      callback(message);
    });
  } catch (error) {
    console.error("subscriber error ", error);
  }
};

export const publish = async (channel: string, message: SseEvent) => {
  try {
    await redisClient.publish(channel, JSON.stringify(message));
  } catch (error) {
    console.error("publish error ", error);
  }
};
