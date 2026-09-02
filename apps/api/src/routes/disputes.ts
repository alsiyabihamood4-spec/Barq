import type { FastifyInstance } from "fastify";
import { z } from "zod";

const resolveSchema = z.object({ resolution: z.enum(["release_provider", "refund_client", "split"]) });

export default async function disputeRoutes(app: FastifyInstance) {
  // Admin — disputes & tickets (5a, section A-05): escrow control panel.
  app.get("/disputes", { preHandler: app.requireRole("ADMIN" as never) }, async (_req, reply) => {
    const disputes = await app.prisma.dispute.findMany({ where: { status: "open" }, orderBy: { openedAt: "desc" } });
    return reply.send(disputes);
  });

  app.post("/disputes/:id/resolve", { preHandler: app.requireRole("ADMIN" as never) }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = resolveSchema.parse(req.body);
    const statusMap = { release_provider: "released_provider", refund_client: "refunded_client", split: "split" } as const;
    const dispute = await app.prisma.dispute.update({
      where: { id },
      data: { status: statusMap[body.resolution], resolvedAt: new Date() },
    });
    const escrowStatus = body.resolution === "release_provider" ? "RELEASED" : body.resolution === "refund_client" ? "REFUNDED" : "SPLIT";
    await app.prisma.escrowLedgerEntry.updateMany({ where: { orderId: dispute.orderId }, data: { status: escrowStatus } });
    return reply.send(dispute);
  });
}
