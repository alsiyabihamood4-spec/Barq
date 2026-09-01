import type { FastifyInstance } from "fastify";

export default async function portRoutes(app: FastifyInstance) {
  app.get("/ports", async (_req, reply) => {
    const ports = await app.prisma.port.findMany({ orderBy: { code: "asc" } });
    return reply.send(
      ports.map((p) => ({ code: p.code, nameAr: p.nameAr, nameEn: p.nameEn, brokers: p.brokers, lat: p.lat, lng: p.lng }))
    );
  });
}
