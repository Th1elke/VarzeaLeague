import type { FastifyReply, FastifyRequest } from "fastify";
import { createCampeonatosRepository } from "./campeonatos.repository.js";
import { createCampeonatosService } from "./campeonatos.service.js";
import type { CampeonatoParams, CriarCampeonatoBody } from "./campeonatos.schema.js";

function service(request: FastifyRequest) {
  return createCampeonatosService(createCampeonatosRepository(request.server.prisma));
}

export async function listarCampeonatosHandler(request: FastifyRequest, reply: FastifyReply) {
  const campeonatos = await service(request).listar();
  return reply.send(campeonatos);
}

export async function obterCampeonatoHandler(
  request: FastifyRequest<{ Params: CampeonatoParams }>,
  reply: FastifyReply,
) {
  const campeonato = await service(request).obter(request.params.id);
  return reply.send(campeonato);
}

export async function criarCampeonatoHandler(request: FastifyRequest, reply: FastifyReply) {
  const body = request.body as CriarCampeonatoBody;
  const campeonato = await service(request).criar(body);
  return reply.status(201).send(campeonato);
}
