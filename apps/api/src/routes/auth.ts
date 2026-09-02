import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { issueOtp, verifyOtp } from "../lib/otp.js";
import { toUserDto } from "../lib/dto.js";
import type { AuthSession } from "@tanafus/types";

const requestOtpSchema = z.object({ mobile: z.string().min(6) });
const verifyOtpSchema = z.object({
  mobile: z.string().min(6),
  code: z.string().length(6),
  role: z.enum(["client", "broker", "carrier", "driver"]).optional(),
  nameAr: z.string().optional(),
  nameEn: z.string().optional(),
  // Set when this OTP verify completes a fresh 3a company sign-up — links
  // the new user to the company POST /companies just created.
  companyId: z.string().optional(),
});

export default async function authRoutes(app: FastifyInstance) {
  // Sign-in / sign-up both start here: request an SMS code for a mobile
  // number. Matches 6b (sign-in) and 3b (sign-up verification) in the design.
  app.post("/auth/otp/request", async (req, reply) => {
    const body = requestOtpSchema.parse(req.body);
    await issueOtp(app, body.mobile);
    // Never leak the code over the wire in a real deployment; returned here
    // only because there's no SMS gateway wired up yet.
    return reply.send({ sent: true, demoHint: "Demo code is 482715" });
  });

  app.post("/auth/otp/verify", async (req, reply) => {
    const body = verifyOtpSchema.parse(req.body);
    const ok = await verifyOtp(app, body.mobile, body.code);
    if (!ok) {
      return reply.code(401).send({ error: "invalid_code", message: "That code is not valid" });
    }

    let user = await app.prisma.user.findUnique({ where: { mobile: body.mobile } });
    if (!user) {
      user = await app.prisma.user.create({
        data: {
          mobile: body.mobile,
          role: (body.role ?? "client").toUpperCase() as never,
          nameAr: body.nameAr ?? "مستخدم جديد",
          nameEn: body.nameEn ?? "New user",
          providerType: body.role && body.role !== "client" ? (body.role.toUpperCase() as never) : undefined,
          companyId: body.companyId,
        },
      });
    } else if (body.companyId && !user.companyId) {
      user = await app.prisma.user.update({ where: { id: user.id }, data: { companyId: body.companyId } });
    }

    const token = app.jwt.sign({ sub: user.id, role: user.role }, { expiresIn: "30d" });
    const session: AuthSession = { token, user: toUserDto(user) };
    return reply.send(session);
  });

  app.get("/auth/me", { preHandler: app.authenticate }, async (req, reply) => {
    const user = await app.prisma.user.findUniqueOrThrow({ where: { id: req.user.sub } });
    return reply.send(toUserDto(user));
  });
}
