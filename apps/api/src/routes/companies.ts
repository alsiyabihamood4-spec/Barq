import type { FastifyInstance } from "fastify";
import { z } from "zod";

const registerSchema = z.object({
  tradeNameAr: z.string().min(1),
  tradeNameEn: z.string().min(1),
  commercialReg: z.string().min(1),
  vatNumber: z.string().min(1),
  signatoryName: z.string().min(1),
  signatoryMobile: z.string().min(6),
});

export default async function companyRoutes(app: FastifyInstance) {
  // 3a — company sign-up. Creates the company shell; the signatory verifies
  // by OTP separately (POST /auth/otp/verify) and is then linked to it.
  app.post("/companies", async (req, reply) => {
    const body = registerSchema.parse(req.body);
    const company = await app.prisma.company.create({ data: body });
    return reply.code(201).send(company);
  });

  // 3h — company profile.
  app.get("/companies/:id", { preHandler: app.authenticate }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const company = await app.prisma.company.findUnique({ where: { id } });
    if (!company) return reply.code(404).send({ error: "not_found", message: "Company not found" });
    return reply.send(company);
  });

  app.get("/companies/:id/sub-accounts", { preHandler: app.authenticate }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const subs = await app.prisma.subAccount.findMany({ where: { companyId: id } });
    return reply.send(subs);
  });
}
