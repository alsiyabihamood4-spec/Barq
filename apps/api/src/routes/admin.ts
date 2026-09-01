import type { FastifyInstance } from "fastify";
import { env } from "../env.js";

/** Admin console (5a) — overview stats, 14-day volume, port split, flags. */
export default async function adminRoutes(app: FastifyInstance) {
  app.get("/admin/overview", { preHandler: app.requireRole("ADMIN" as never) }, async (_req, reply) => {
    const [activeOperations, heldAgg, commissionAgg, pendingKyc, orders] = await Promise.all([
      app.prisma.order.count({ where: { stage: { not: "DELIVERED" } } }),
      app.prisma.escrowLedgerEntry.aggregate({ _sum: { amountOmr: true }, where: { status: "HELD" } }),
      app.prisma.escrowLedgerEntry.aggregate({
        _sum: { commissionOmr: true },
        where: { createdAt: { gte: new Date(new Date().setDate(1)) } },
      }),
      app.prisma.kycApplication.count({ where: { status: { in: ["IN_REVIEW", "MISSING_DOCS"] } } }),
      app.prisma.order.findMany({ select: { portCode: true, service: true, createdAt: true } }),
    ]);

    const byPort = new Map<string, number>();
    for (const o of orders) byPort.set(o.portCode, (byPort.get(o.portCode) ?? 0) + 1);
    const total = orders.length || 1;
    const splitByPort = [...byPort.entries()].map(([portCode, count]) => ({
      portCode,
      pct: Math.round((count / total) * 100),
    }));

    // 14-day volume split (clearance vs. freight) straight from order rows —
    // sparse on a freshly seeded database, fills in as real orders land.
    const days: { date: string; clearance: number; freight: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayOrders = orders.filter((o) => o.createdAt.toISOString().slice(0, 10) === key);
      days.push({
        date: key,
        clearance: dayOrders.filter((o) => o.service !== "FREIGHT").length,
        freight: dayOrders.filter((o) => o.service === "FREIGHT").length,
      });
    }

    // "Needs intervention": clearance orders stuck for 3+ days, and open
    // tenders with no bids closing within the hour.
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const [stuckOrders, staleTenders] = await Promise.all([
      app.prisma.order.findMany({
        where: { stage: { in: ["DECLARATION", "INSPECTION"] }, createdAt: { lt: threeDaysAgo } },
        take: 3,
      }),
      app.prisma.tender.findMany({
        where: { status: "OPEN", bids: { none: {} }, closesAt: { lt: new Date(Date.now() + 60 * 60 * 1000) } },
        take: 3,
      }),
    ]);
    const flags = [
      ...stuckOrders.map((o) => ({ code: o.code, ar: "تأخر الفسح ثلاثة أيام", en: "Clearance three days late" })),
      ...staleTenders.map((t) => ({ code: t.code, ar: "مناقصة بلا عروض — تنتهي خلال ساعة", en: "Tender with no bids — closes in an hour" })),
    ];

    return reply.send({
      activeOperations,
      heldInEscrowOmr: heldAgg._sum.amountOmr ?? 0,
      commissionMonthToDateOmr: commissionAgg._sum.commissionOmr ?? 0,
      pendingKyc,
      commissionPct: env.commissionPct,
      splitByPort,
      volumeByDay: days,
      flags,
    });
  });

  // Operations monitor (section A-03): every tender/order with its stage
  // and escrow status, flagged rows first.
  app.get("/admin/ops", { preHandler: app.requireRole("ADMIN" as never) }, async (_req, reply) => {
    const orders = await app.prisma.order.findMany({
      include: { client: true, provider: true, tender: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return reply.send(orders);
  });

  // Financial centre (section A-04): escrow account totals + payout queue.
  app.get("/admin/finance", { preHandler: app.requireRole("ADMIN" as never) }, async (_req, reply) => {
    const [held, commission, payouts] = await Promise.all([
      app.prisma.escrowLedgerEntry.aggregate({ _sum: { amountOmr: true }, where: { status: "HELD" } }),
      app.prisma.escrowLedgerEntry.aggregate({ _sum: { commissionOmr: true } }),
      app.prisma.withdrawalRequest.findMany({ where: { status: "requested" }, include: { provider: true }, orderBy: { createdAt: "desc" } }),
    ]);
    return reply.send({
      heldOmr: held._sum.amountOmr ?? 0,
      commissionOmr: commission._sum.commissionOmr ?? 0,
      payouts,
    });
  });

  app.post("/admin/payouts/:id/pay", { preHandler: app.requireRole("ADMIN" as never) }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const payout = await app.prisma.withdrawalRequest.update({ where: { id }, data: { status: "paid" } });
    return reply.send(payout);
  });
  app.post("/admin/payouts/:id/hold", { preHandler: app.requireRole("ADMIN" as never) }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const payout = await app.prisma.withdrawalRequest.update({ where: { id }, data: { status: "held" } });
    return reply.send(payout);
  });
}
