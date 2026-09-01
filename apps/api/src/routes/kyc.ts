import type { FastifyInstance } from "fastify";
import { z } from "zod";

const docSets: Record<string, { key: string; labelAr: string; labelEn: string }[]> = {
  BROKER: [
    { key: "d1", labelAr: "البطاقة الشخصية", labelEn: "National ID card" },
    { key: "d2", labelAr: "السجل التجاري", labelEn: "Commercial registration" },
    { key: "d3", labelAr: "البطاقة المهنية للتخليص", labelEn: "Customs broker licence" },
    { key: "d4", labelAr: "تصريح دخول الميناء", labelEn: "Port access permit" },
  ],
  CARRIER: [
    { key: "d1", labelAr: "البطاقة الشخصية للمالك", labelEn: "Owner national ID" },
    { key: "d2", labelAr: "السجل التجاري", labelEn: "Commercial registration" },
    { key: "d3", labelAr: "ترخيص النقل البري", labelEn: "Road transport licence" },
    { key: "d4", labelAr: "وثائق ملكية المركبات", labelEn: "Vehicle ownership papers" },
  ],
  DRIVER: [
    { key: "d1", labelAr: "البطاقة الشخصية", labelEn: "National ID card" },
    { key: "d2", labelAr: "رخصة القيادة (ثقيل)", labelEn: "Heavy vehicle licence" },
    { key: "d3", labelAr: "بطاقة مرور الميناء", labelEn: "Port access pass" },
    { key: "d4", labelAr: "الفحص الطبي", labelEn: "Medical fitness report" },
  ],
};

const createSchema = z.object({
  providerType: z.enum(["broker", "carrier", "driver"]),
  requestedPortCodes: z.array(z.string()).default([]),
});
const uploadSchema = z.object({ docKey: z.string(), fileUrl: z.string().optional() });
const decideSchema = z.object({ approve: z.boolean(), reviewerNote: z.string().optional() });

export default async function kycRoutes(app: FastifyInstance) {
  // Partner onboarding (2a): pick a provider type — brokers must also pick
  // which ports they're licensed for (geo-fences their tender feed later).
  app.post("/kyc", { preHandler: app.authenticate }, async (req, reply) => {
    const body = createSchema.parse(req.body);
    const providerType = body.providerType.toUpperCase() as "BROKER" | "CARRIER" | "DRIVER";
    const application = await app.prisma.kycApplication.create({
      data: {
        applicantId: req.user.sub,
        providerType,
        requestedPorts: { connect: body.requestedPortCodes.map((code) => ({ code })) },
        documents: { create: docSets[providerType]!.map((d) => ({ ...d, uploaded: false })) },
      },
      include: { documents: true, requestedPorts: true },
    });
    await app.prisma.user.update({ where: { id: req.user.sub }, data: { providerType, kycStatus: "MISSING_DOCS" } });
    return reply.code(201).send(application);
  });

  app.get("/kyc/me", { preHandler: app.authenticate }, async (req, reply) => {
    const application = await app.prisma.kycApplication.findFirst({
      where: { applicantId: req.user.sub },
      orderBy: { submittedAt: "desc" },
      include: { documents: true, requestedPorts: true },
    });
    return reply.send(application);
  });

  // Document upload (2a): toggles a document as uploaded; once all four are
  // in, status flips to in_review — matches doneDocs === docList.length in
  // the prototype's kycBtnBg/kycOpacity logic.
  app.post("/kyc/:id/documents", { preHandler: app.authenticate }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = uploadSchema.parse(req.body);
    await app.prisma.kycDocument.updateMany({
      where: { applicationId: id, key: body.docKey },
      data: { uploaded: true, fileUrl: body.fileUrl, uploadedAt: new Date() },
    });
    const docs = await app.prisma.kycDocument.findMany({ where: { applicationId: id } });
    const allUploaded = docs.every((d) => d.uploaded);
    const application = await app.prisma.kycApplication.update({
      where: { id },
      data: { status: allUploaded ? "IN_REVIEW" : "MISSING_DOCS" },
      include: { documents: true, requestedPorts: true },
    });
    if (allUploaded) {
      await app.prisma.user.update({ where: { id: application.applicantId }, data: { kycStatus: "IN_REVIEW" } });
    }
    return reply.send(application);
  });

  // Admin — KYC queue (5a, section A-02): approve activates the account,
  // reject sends it back with a reviewer note (4a's "note from the
  // reviewer" card).
  app.get("/kyc", { preHandler: app.requireRole("ADMIN" as never) }, async (_req, reply) => {
    const applications = await app.prisma.kycApplication.findMany({
      where: { status: { in: ["IN_REVIEW", "MISSING_DOCS"] } },
      include: { applicant: true, documents: true, requestedPorts: true },
      orderBy: { submittedAt: "asc" },
    });
    return reply.send(applications);
  });

  app.post("/kyc/:id/decision", { preHandler: app.requireRole("ADMIN" as never) }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = decideSchema.parse(req.body);
    const application = await app.prisma.kycApplication.update({
      where: { id },
      data: { status: body.approve ? "APPROVED" : "REJECTED", reviewerNote: body.reviewerNote, decidedAt: new Date() },
    });
    await app.prisma.user.update({
      where: { id: application.applicantId },
      data: { kycStatus: body.approve ? "APPROVED" : "REJECTED" },
    });
    return reply.send(application);
  });
}
