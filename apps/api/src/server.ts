import Fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import prismaPlugin from "./plugins/prisma.js";
import redisPlugin from "./plugins/redis.js";
import authPlugin from "./plugins/auth.js";
import authRoutes from "./routes/auth.js";
import companyRoutes from "./routes/companies.js";
import portRoutes from "./routes/ports.js";
import tenderRoutes from "./routes/tenders.js";
import bidRoutes from "./routes/bids.js";
import orderRoutes from "./routes/orders.js";
import kycRoutes from "./routes/kyc.js";
import walletRoutes from "./routes/wallet.js";
import adminRoutes from "./routes/admin.js";
import disputeRoutes from "./routes/disputes.js";
import providerRoutes from "./routes/providers.js";
import realtimeRoutes from "./routes/realtime.js";

export async function buildServer() {
  const app = Fastify({
    logger: {
      transport: process.env.NODE_ENV === "production" ? undefined : { target: "pino-pretty" },
    },
  });

  await app.register(cors, { origin: true });
  await app.register(websocket);
  await app.register(prismaPlugin);
  await app.register(redisPlugin);
  await app.register(authPlugin);

  app.get("/health", async () => ({ ok: true, service: "BARQ-api" }));

  await app.register(authRoutes);
  await app.register(companyRoutes);
  await app.register(portRoutes);
  await app.register(tenderRoutes);
  await app.register(bidRoutes);
  await app.register(orderRoutes);
  await app.register(kycRoutes);
  await app.register(walletRoutes);
  await app.register(adminRoutes);
  await app.register(disputeRoutes);
  await app.register(providerRoutes);
  await app.register(realtimeRoutes);

  return app;
}
