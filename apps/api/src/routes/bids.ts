import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { generateOrderCode, generateDeliveryOtp } from "../lib/codes.js";
import { splitCommission } from "../lib/commission.js";
import { toOrderDto } from "../lib/dto.js";
import { env } from "../env.js";

const submitBidSchema = z.object({ priceOmr: z.number().positive(), etaHours: z.number().positive() });

export default async function bidRoutes(app: FastifyInstance) {
  // Partner — bid sheet (4b): submit a competitive price + ETA on an open tender.
  app.post("/tenders/:id/bids", { preHandler: app.authenticate }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = submitBidSchema.parse(req.body);
    const tender = await app.prisma.tender.findUnique({ where: { id } });
    if (!tender || tender.status !== "OPEN") {
      return reply.code(400).send({ error: "tender_closed", message: "This tender is no longer open" });
    }
    const bid = await app.prisma.bid.create({
      data: { tenderId: id, providerId: req.user.sub, priceOmr: body.priceOmr, etaHours: Math.round(body.etaHours) },
    });
    const bidCount = await app.prisma.bid.count({ where: { tenderId: id } });
    await app.redis.publish("tenders:bid", JSON.stringify({ tenderId: id, bidCount })).catch(() => {});
    return reply.code(201).send(bid);
  });

  // Client — bid comparison (1b): sort/compare happens client-side over this
  // list; accepting a bid awards the tender, funds escrow, and opens the
  // order at stage 1 (assigned) — the same transition 1c's checkout confirms.
  app.post("/bids/:id/accept", { preHandler: app.authenticate }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const bid = await app.prisma.bid.findUnique({ where: { id }, include: { tender: true } });
    if (!bid) return reply.code(404).send({ error: "not_found", message: "Bid not found" });
    if (bid.tender.clientId !== req.user.sub) {
      return reply.code(403).send({ error: "forbidden", message: "Not your tender" });
    }

    const { amountOmr } = splitCommission(bid.priceOmr, env.commissionPct);

    const [order] = await app.prisma.$transaction([
      app.prisma.order.create({
        data: {
          code: generateOrderCode(),
          tenderId: bid.tenderId,
          clientId: bid.tender.clientId,
          providerId: bid.providerId,
          service: bid.tender.service,
          portCode: bid.tender.portCode,
          escrowOmr: amountOmr,
          deliveryOtp: generateDeliveryOtp(),
        },
      }),
      app.prisma.bid.update({ where: { id }, data: { status: "ACCEPTED" } }),
      app.prisma.bid.updateMany({ where: { tenderId: bid.tenderId, id: { not: id } }, data: { status: "REJECTED" } }),
      app.prisma.tender.update({ where: { id: bid.tenderId }, data: { status: "AWARDED" } }),
    ]);

    await app.prisma.escrowLedgerEntry.create({
      data: { orderId: order.id, ...splitCommission(bid.priceOmr, env.commissionPct), status: "HELD" },
    });

    return reply.send(toOrderDto(order));
  });
}
