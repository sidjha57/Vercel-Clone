import { createClient, RedisClientType } from "redis";

export let subscriber: RedisClientType;

export async function initializeRedisClient(): Promise<void> {
  subscriber = createClient({
    socket: {
      host: process.env.REDIS_HOST ?? "localhost",
      port: (process.env.REDIS_PORT as unknown as number) ?? 6379,
    },
  });

  try {
    await subscriber.connect();
    console.log("Connected to Redis!");
  } catch (error) {
    console.error("Error connecting to Redis:", error);
  }
}
