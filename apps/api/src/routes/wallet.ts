import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { generateWithdrawalCode } from "../lib/codes.js";

const withdrawSchema = z.object({
  amountOmr: z.number().positive(),
  bankName: z.string(),
  accountHolder: z.string(),
  iban: z.string(),
});

export default async function walletRoutes(app: FastifyInstance) {
  // Partner wallet (2d / 4c): pending-in-escrow vs completed tabs, backed by
  // the same wallet_transactions rows the delivery/escrow-release flow writes.
  app.get("/wallet", { preHandler: app.authenticate }, async (req, reply) => {
    const [pending, completed] = await Promise.all([
      app.prisma.walletTransaction.findMany({ where: { providerId: req.user.sub, pending: true }, orderBy: { createdAt: "desc" } }),
      app.prisma.walletTransaction.findMany({ where: { providerId: req.user.sub, pending: false }, orderBy: { createdAt: "desc" } }),
    ]);
    const available = completed
      .filter((t) => t.status === "RELEASED")
      .reduce((sum, t) => sum + t.amountOmr, 0) -
      completed.filter((t) => t.status === "PAID OUT").reduce((sum, t) => sum + Math.abs(t.amountOmr), 0);
    return reply.send({ pending, completed, availableOmr: Math.max(0, available) });
  });

  app.post("/wallet/withdraw", { preHandler: app.authenticate }, async (req, reply) => {
    const body = withdrawSchema.parse(req.body);
    const request = await app.prisma.withdrawalRequest.create({
      data: {
        providerId: req.user.sub,
        amountOmr: body.amountOmr,
        bankName: body.bankName,
        accountHolder: body.accountHolder,
        iban: body.iban,
      },
    });
    await app.prisma.walletTransaction.create({
      data: {
        providerId: req.user.sub,
        withdrawalId: request.id,
        labelAr: "سحب إلى الحساب البنكي",
        labelEn: "Withdrawal to bank account",
        meta: `${generateWithdrawalCode()} · ${new Date().toLocaleDateString()}`,
        amountOmr: -body.amountOmr,
        pending: false,
        status: "PAID OUT",
      },
    });
    return reply.code(201).send(request);
  });
}
