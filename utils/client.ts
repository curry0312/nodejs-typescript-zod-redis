import { createClient, RedisClientType } from "redis";

let client: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType> {
  if (!client) {
    client = createClient({
      socket: {
        host: process.env.REDIS_HOST || "localhost",
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    });
    client.on("error", (err) => console.log("Redis Client Error", err));
    client.on("connect", () => console.log("Redis Client Connected"));
    await client.connect();
  }
  return client;
}
