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
    const subs = await app.prisma.subAccount.findMany({ where: { companyId: id }, orderBy: { id: "asc" } });
    return reply.send(subs);
  });

  // 3h — "add a team member" (the prototype's subAccounts list + toggle,
  // made writable). The adding signatory becomes the sub-account's `owner`
  // relation — sub-accounts are team-member records, not their own login.
  app.post("/companies/:id/sub-accounts", { preHandler: app.authenticate }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = z.object({ nameAr: z.string().min(1), nameEn: z.string().min(1), role: z.string().min(1) }).parse(req.body);
    const sub = await app.prisma.subAccount.create({
      data: { companyId: id, ownerId: req.user.sub, nameAr: body.nameAr, nameEn: body.nameEn, role: body.role },
    });
    return reply.code(201).send(sub);
  });

  app.patch("/companies/:id/sub-accounts/:subId", { preHandler: app.authenticate }, async (req, reply) => {
    const { subId } = req.params as { id: string; subId: string };
    const body = z.object({ active: z.boolean() }).parse(req.body);
    const sub = await app.prisma.subAccount.update({ where: { id: subId }, data: { active: body.active } });
    return reply.send(sub);
  });

  app.delete("/companies/:id/sub-accounts/:subId", { preHandler: app.authenticate }, async (req, reply) => {
    const { subId } = req.params as { id: string; subId: string };
    await app.prisma.subAccount.delete({ where: { id: subId } });
    return reply.code(204).send();
  });
}
