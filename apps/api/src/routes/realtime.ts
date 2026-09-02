import type { FastifyInstance } from "fastify";
import type { WebSocket } from "ws";
import { Redis } from "ioredis";
import { env } from "../env.js";

/**
 * Live tender feed (2b): a dedicated Redis subscriber connection (pub/sub
 * requires its own connection — a subscribing client can't run other
 * commands) fans out `tenders:new` / `tenders:bid` publishes — already
 * emitted by routes/tenders.ts and routes/bids.ts — to every connected
 * WebSocket client. One subscriber for all clients, not one per
 * connection. Falls back to nothing (the mobile feed still works via its
 * on-mount fetch) if Redis is unavailable.
 */
export default async function realtimeRoutes(app: FastifyInstance) {
  const clients = new Set<WebSocket>();
  const sub = new Redis(env.redisUrl, { lazyConnect: true, maxRetriesPerRequest: 2 });

  sub.on("message", (channel: string, message: string) => {
    let payload: unknown = {};
    try {
      payload = JSON.parse(message);
    } catch {
      /* ignore malformed publishes */
    }
    const frame = JSON.stringify({ channel, ...(typeof payload === "object" && payload ? payload : {}) });
    for (const ws of clients) {
      if (ws.readyState === ws.OPEN) ws.send(frame);
    }
  });

  try {
    await sub.connect();
    await sub.subscribe("tenders:new", "tenders:bid");
  } catch (err) {
    app.log.warn({ err }, "Realtime: Redis subscriber unavailable — live tender feed falls back to on-load fetch only");
  }

  app.get("/ws/tenders", { websocket: true }, (socket) => {
    clients.add(socket);
    socket.on("close", () => clients.delete(socket));
  });

  app.addHook("onClose", async () => {
    clients.clear();
    await sub.quit().catch(() => {});
  });
}
