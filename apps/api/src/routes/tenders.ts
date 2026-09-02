import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { generateTenderCode } from "../lib/codes.js";

const createTenderSchema = z.object({
  service: z.enum(["clearance", "inspection", "gov", "freight"]),
  portCode: z.string(),
  shipment: z.object({
    billOfLading: z.string(),
    invoiceNo: z.string(),
    grossWeightKg: z.number(),
    pieceCount: z.number().optional(),
    declaredValueOmr: z.number(),
    taxExempt: z.boolean().default(false),
    deliveryLocation: z.string().optional(),
    deliveryLat: z.number().min(-90).max(90).optional(),
    deliveryLng: z.number().min(-180).max(180).optional(),
    truckType: z.string().optional(),
  }),
  titleAr: z.string(),
  titleEn: z.string(),
  descAr: z.string().default(""),
  descEn: z.string().default(""),
  clientNotes: z.string().optional(),
  durationMinutes: z.number().min(1).max(720).default(85),
});

const serviceMap = { clearance: "CLEARANCE", inspection: "INSPECTION", gov: "GOV", freight: "FREIGHT" } as const;

export default async function tenderRoutes(app: FastifyInstance) {
  // Client — request creation flow (1a / 3a-d): post a new tender and start
  // its countdown.
  app.post("/tenders", { preHandler: app.authenticate }, async (req, reply) => {
    const body = createTenderSchema.parse(req.body);
    const closesAt = new Date(Date.now() + body.durationMinutes * 60_000);
    const tender = await app.prisma.tender.create({
      data: {
        code: generateTenderCode(),
        clientId: req.user.sub,
        service: serviceMap[body.service],
        portCode: body.portCode,
        titleAr: body.titleAr,
        titleEn: body.titleEn,
        descAr: body.descAr,
        descEn: body.descEn,
        billOfLading: body.shipment.billOfLading,
        invoiceNo: body.shipment.invoiceNo,
        grossWeightKg: body.shipment.grossWeightKg,
        pieceCount: body.shipment.pieceCount,
        declaredValueOmr: body.shipment.declaredValueOmr,
        taxExempt: body.shipment.taxExempt,
        deliveryLocation: body.shipment.deliveryLocation,
        deliveryLat: body.shipment.deliveryLat,
        deliveryLng: body.shipment.deliveryLng,
        truckType: body.shipment.truckType,
        clientNotes: body.clientNotes,
        closesAt,
      },
    });
    await app.redis.publish("tenders:new", JSON.stringify({ id: tender.id, portCode: tender.portCode })).catch(() => {});
    return reply.code(201).send(tender);
  });

  // Partner — live tender feed (2b), geo-fenced to the provider's licensed
  // ports (a broker with `kycPorts` set only sees tenders for those ports;
  // carriers/drivers see everything open, matching the prototype).
  app.get("/tenders", { preHandler: app.authenticate }, async (req, reply) => {
    const query = req.query as { portCode?: string };
    const tenders = await app.prisma.tender.findMany({
      where: {
        status: "OPEN",
        portCode: query.portCode,
        closesAt: { gt: new Date() },
      },
      include: { documents: true, bids: true },
      orderBy: { closesAt: "asc" },
    });
    return reply.send(tenders.map((t) => ({ ...t, bidCount: t.bids.length })));
  });

  app.get("/tenders/:id", { preHandler: app.authenticate }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const tender = await app.prisma.tender.findUnique({
      where: { id },
      include: { documents: true, bids: { include: { provider: true }, orderBy: { priceOmr: "asc" } } },
    });
    if (!tender) return reply.code(404).send({ error: "not_found", message: "Tender not found" });
    return reply.send(tender);
  });
}
