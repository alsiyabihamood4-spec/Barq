import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { Redis } from "ioredis";
import { env } from "../env.js";

declare module "fastify" {
  interface FastifyInstance {
    redis: Redis;
  }
}

/**
 * Redis backs three things from the architecture diagram: OTP codes (short
 * TTL), tender countdown state so many readers don't hammer Postgres for a
 * value that changes every second, and a pub/sub channel that WS clients
 * subscribe to for live tender/GPS updates (see routes/realtime.ts).
 */
export default fp(async (app: FastifyInstance) => {
  const redis = new Redis(env.redisUrl, { lazyConnect: true, maxRetriesPerRequest: 2 });
  try {
    await redis.connect();
  } catch (err) {
    app.log.warn({ err }, "Redis unavailable — falling back to in-memory OTP/cache for local dev");
  }
  app.decorate("redis", redis);
  app.addHook("onClose", async (instance) => {
    instance.redis.disconnect();
  });
});
