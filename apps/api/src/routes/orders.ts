import type { FastifyInstance } from "fastify";
import { z } from "zod";

const STAGE_ORDER = ["ASSIGNED", "DECLARATION", "INSPECTION", "RELEASED", "IN_TRANSIT", "DELIVERED"] as const;

const rateSchema = z.object({ rating: z.number().min(1).max(5), traits: z.array(z.string()).default([]) });
const deliverSchema = z.object({ otp: z.string().length(6) });

export default async function orderRoutes(app: FastifyInstance) {
  app.get("/orders/:id", { preHandler: app.authenticate }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const order = await app.prisma.order.findUnique({
      where: { id },
      include: { tender: true, client: true, provider: true, dispute: true },
    });
    if (!order) return reply.code(404).send({ error: "not_found", message: "Order not found" });
    return reply.send(order);
  });

  // Home & active shipments (3c): the client's live list.
  app.get("/orders", { preHandler: app.authenticate }, async (req, reply) => {
    const orders = await app.prisma.order.findMany({
      where: { OR: [{ clientId: req.user.sub }, { providerId: req.user.sub }] },
      include: { tender: true },
      orderBy: { createdAt: "desc" },
    });
    return reply.send(orders);
  });

  // Clearance stepper (1d) / broker active-job screen (2c broker view):
  // advances one stage. Freight orders skip declaration/inspection and move
  // straight to in_transit → delivered from the carrier's "start trip" (2c).
  app.post("/orders/:id/advance", { preHandler: app.authenticate }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const order = await app.prisma.order.findUnique({ where: { id } });
    if (!order) return reply.code(404).send({ error: "not_found", message: "Order not found" });
    const idx = STAGE_ORDER.indexOf(order.stage);
    const next = STAGE_ORDER[Math.min(idx + 1, STAGE_ORDER.length - 1)]!;
    const updated = await app.prisma.order.update({ where: { id }, data: { stage: next } });
    return reply.send(updated);
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
    return reply.send(updated);
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
    return reply.send(order);
  });
}
