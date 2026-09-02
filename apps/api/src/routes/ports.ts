import type { FastifyInstance } from "fastify";
import { z } from "zod";

const nearestSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

export default async function portRoutes(app: FastifyInstance) {
  app.get("/ports", async (_req, reply) => {
    const ports = await app.prisma.port.findMany({ orderBy: { code: "asc" } });
    return reply.send(
      ports.map((p) => ({ code: p.code, nameAr: p.nameAr, nameEn: p.nameEn, brokers: p.brokers, lat: p.lat, lng: p.lng }))
    );
  });

  // Real PostGIS query — orders every port by great-circle distance from a
  // given point using the geography column's ST_Distance (accounts for
  // Earth's curvature, unlike a flat lat/lng comparison). Not wired into
  // the mobile request-creation flow yet (that still lets the client cycle
  // through the four ports directly, matching the prototype), but proves
  // the PostGIS provisioning is real and queryable, not just declared.
  app.get("/ports/nearest", async (req, reply) => {
    const { lat, lng } = nearestSchema.parse(req.query);
    const rows = await app.prisma.$queryRaw<
      { code: string; nameAr: string; nameEn: string; brokers: number; distanceKm: number }[]
    >`
      SELECT code, "nameAr", "nameEn", brokers,
             ST_Distance(geog, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography) / 1000 AS "distanceKm"
      FROM ports
      ORDER BY geog <-> ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
    `;
    return reply.send(rows.map((r) => ({ ...r, distanceKm: Math.round(r.distanceKm * 10) / 10 })));
  });
}
