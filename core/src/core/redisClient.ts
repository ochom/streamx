import { RedisClient } from "bun";
import type { SseEvent } from "./types";

// init redis client
const redisClient = new RedisClient(process.env.REDIS_URL);

const initClient = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error("Redis client initialization error", error);
  }
};

initClient();

export const subscribe = async (
  channel: string,
  callback: (message: string) => void,
) => {
  try {
    const subscriber = await redisClient.duplicate();
    await subscriber.subscribe(channel, (message) => {
      callback(message);
    });
    subscriber.close();
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
