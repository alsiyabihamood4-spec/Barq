import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { env } from "../env.js";
import type { Role } from "@prisma/client";

export interface JwtPayload {
  sub: string;
  role: Role;
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (...roles: Role[]) => (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

export default fp(async (app: FastifyInstance) => {
  await app.register(fastifyJwt, { secret: env.jwtSecret });

  app.decorate("authenticate", async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      await req.jwtVerify();
    } catch {
      reply.code(401).send({ error: "unauthorized", message: "Sign in to continue" });
    }
  });

  app.decorate("requireRole", (...roles: Role[]) => async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      await req.jwtVerify();
    } catch {
      reply.code(401).send({ error: "unauthorized", message: "Sign in to continue" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      reply.code(403).send({ error: "forbidden", message: "Not allowed for this role" });
    }
  });
});
