import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { STAGE_SEQUENCE, toOrderDto } from "../lib/dto.js";

const rateSchema = z.object({ rating: z.number().min(1).max(5), traits: z.array(z.string()).default([]) });
const deliverSchema = z.object({ otp: z.string().length(6) });
const locationSchema = z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) });

const GEO_KEY = "live:vehicles";
const orderMember = (id: string) => `order:${id}`;
const destMember = (id: string) => `dest:${id}`;

export default async function orderRoutes(app: FastifyInstance) {
  app.get("/orders/:id", { preHandler: app.authenticate }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const order = await app.prisma.order.findUnique({ where: { id } });
    if (!order) return reply.code(404).send({ error: "not_found", message: "Order not found" });
    return reply.send(toOrderDto(order));
  });

  // Home & active shipments (3c): the client's live list.
  app.get("/orders", { preHandler: app.authenticate }, async (req, reply) => {
    const orders = await app.prisma.order.findMany({
      where: { OR: [{ clientId: req.user.sub }, { providerId: req.user.sub }] },
      orderBy: { createdAt: "desc" },
    });
    return reply.send(orders.map(toOrderDto));
  });

  // Clearance stepper (1d) / broker active-job screen (2c broker view):
  // advances one stage along the order's service-specific sequence
  // (STAGE_SEQUENCE in lib/dto.ts — also what stageIndex/stageCount report).
  app.post("/orders/:id/advance", { preHandler: app.authenticate }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const order = await app.prisma.order.findUnique({ where: { id } });
    if (!order) return reply.code(404).send({ error: "not_found", message: "Order not found" });
    const stages = STAGE_SEQUENCE[order.service];
    const idx = stages.indexOf(order.stage);
    const next = stages[Math.min(idx + 1, stages.length - 1)]!;
    const updated = await app.prisma.order.update({ where: { id }, data: { stage: next } });
    return reply.send(toOrderDto(updated));
  });

  // Live GPS (2c carrier view / 1d freight tab): the carrier's app posts its
  // position; Redis GEO (GEOADD/GEODIST) is the "Live Vehicle GPS Buffer"
  // from the architecture diagram — fast-changing, not worth a Postgres
  // write on every ping. Destination is geo-added once from the tender's
  // delivery coordinates so GEODIST can report remaining distance.
  app.post("/orders/:id/location", { preHandler: app.authenticate }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = locationSchema.parse(req.body);
    const order = await app.prisma.order.findUnique({ where: { id }, include: { tender: true } });
    if (!order) return reply.code(404).send({ error: "not_found", message: "Order not found" });
    if (order.providerId !== req.user.sub) {
      return reply.code(403).send({ error: "forbidden", message: "Not your job" });
    }

    await app.redis.geoadd(GEO_KEY, body.lng, body.lat, orderMember(id));
    if (order.tender.deliveryLat != null && order.tender.deliveryLng != null) {
      await app.redis.geoadd(GEO_KEY, order.tender.deliveryLng, order.tender.deliveryLat, destMember(id));
    }
    return reply.send({ ok: true });
  });

  app.get("/orders/:id/location", { preHandler: app.authenticate }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const [pos] = await app.redis.geopos(GEO_KEY, orderMember(id));
    if (!pos) return reply.send({ tracking: false });
    // ioredis's typed `geodist` overloads don't resolve cleanly with a unit
    // argument in this version; `call` sends the raw GEODIST command instead.
    const distanceKm = (await app.redis
      .call("GEODIST", GEO_KEY, orderMember(id), destMember(id), "km")
      .catch(() => null)) as string | null;
    return reply.send({
      tracking: true,
      lng: Number(pos[0]),
      lat: Number(pos[1]),
      distanceKm: distanceKm ? Math.round(Number(distanceKm) * 10) / 10 : null,
    });
  });

  // OTP delivery confirmation (1e / 2c carrier view): the driver enters the
  // code the client shows on their device; matching closes the job and
  // releases the held escrow entry.
  app.post("/orders/:id/deliver", { preHandler: app.authenticate }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = deliverSchema.parse(req.body);
    const order = await app.prisma.order.findUnique({ where: { id } });
    if (!order) return reply.code(404).send({ error: "not_found", message: "Order not found" });
    if (body.otp !== order.deliveryOtp) {
      return reply.code(400).send({ error: "invalid_otp", message: "Code does not match" });
    }
    const [updated] = await app.prisma.$transaction([
      app.prisma.order.update({ where: { id }, data: { stage: "DELIVERED", deliveredAt: new Date() } }),
      app.prisma.escrowLedgerEntry.updateMany({ where: { orderId: id }, data: { status: "RELEASED" } }),
      app.prisma.walletTransaction.create({
        data: {
          providerId: order.providerId,
          orderId: order.id,
          labelAr: "دفعة محرَّرة من الضمان",
          labelEn: "Escrow release",
          meta: `${order.code} · ${new Date().toLocaleDateString()}`,
          amountOmr: order.escrowOmr,
          pending: false,
          status: "RELEASED",
        },
      }),
    ]);
    return reply.send(toOrderDto(updated));
  });

  // Rating & review (1e's follow-up screen): client rates the provider,
  // rolled into the provider's running average.
  app.post("/orders/:id/rate", { preHandler: app.authenticate }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = rateSchema.parse(req.body);
    const order = await app.prisma.order.update({
      where: { id },
      data: { rating: body.rating, ratingTraits: body.traits },
    });
    const provider = await app.prisma.user.findUniqueOrThrow({ where: { id: order.providerId } });
    const newCount = provider.ratingCount + 1;
    const newAvg = (provider.ratingAvg * provider.ratingCount + body.rating) / newCount;
    await app.prisma.user.update({ where: { id: provider.id }, data: { ratingAvg: newAvg, ratingCount: newCount } });
    return reply.send(toOrderDto(order));
  });
}
