import type { FastifyReply, FastifyRequest } from "fastify";
import { createAuthRepository } from "./auth.repository.js";
import { createAuthService } from "./auth.service.js";
import type { LoginBody, RegistroBody } from "./auth.schema.js";

export async function registrarHandler(
  request: FastifyRequest<{ Body: RegistroBody }>,
  reply: FastifyReply,
) {
  const service = createAuthService(createAuthRepository(request.server.prisma));
  const usuario = await service.registrar(request.body.email, request.body.senha);
  const token = await reply.jwtSign({ sub: usuario.id, email: usuario.email });

  return reply.status(201).send({ token, usuario });
}

export async function loginHandler(
  request: FastifyRequest<{ Body: LoginBody }>,
  reply: FastifyReply,
) {
  const service = createAuthService(createAuthRepository(request.server.prisma));
  const usuario = await service.login(request.body.email, request.body.senha);
  const token = await reply.jwtSign({ sub: usuario.id, email: usuario.email });

  return reply.status(200).send({ token, usuario });
}
