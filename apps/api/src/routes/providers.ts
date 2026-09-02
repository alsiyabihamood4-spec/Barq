import type { FastifyInstance } from "fastify";
import { toUserDto } from "../lib/dto.js";

/** 3e — provider public profile (rating summary). No free-text reviews are
 * stored yet (orders capture a 1-5 rating + trait tags only), so this route
 * returns the real aggregates and lets the screen say so rather than
 * inventing quotes. */
export default async function providerRoutes(app: FastifyInstance) {
  app.get("/providers/:id", { preHandler: app.authenticate }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const user = await app.prisma.user.findUnique({ where: { id } });
    if (!user) return reply.code(404).send({ error: "not_found", message: "Provider not found" });

    const rated = await app.prisma.order.findMany({
      where: { providerId: id, rating: { not: null } },
      select: { rating: true, ratingTraits: true },
    });
    const traitCounts: Record<string, number> = {};
    for (const o of rated) for (const t of o.ratingTraits) traitCounts[t] = (traitCounts[t] ?? 0) + 1;

    return reply.send({ ...toUserDto(user), completedRatings: rated.length, topTraits: Object.entries(traitCounts).sort((a, b) => b[1] - a[1]).map(([k]) => k) });
  });
}
