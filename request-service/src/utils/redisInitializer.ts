import { createClient, RedisClientType } from "redis";

export let publisher: RedisClientType;

export async function initializeRedisClient(): Promise<void> {
  publisher = createClient({
    socket: {
      host: process.env.REDIS_HOST ?? "localhost",
      port: (process.env.REDIS_PORT as unknown as number) ?? 6379,
    },
  });

  try {
    await publisher.connect();
    console.log("Connected to Redis!");
  } catch (error) {
    console.error("Error connecting to Redis:", error);
  }
}
