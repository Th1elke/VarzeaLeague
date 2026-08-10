import type { FastifyReply, FastifyRequest } from "fastify";
import type { CampeonatoParams } from "../campeonatos/campeonatos.schema.js";
import { createPartidasRepository } from "./partidas.repository.js";
import { createPartidasService } from "./partidas.service.js";
import type {
  AgendarPartidaBody,
  LancarResultadoBody,
  PartidaParams,
} from "./partidas.schema.js";

function service(request: FastifyRequest) {
  return createPartidasService(createPartidasRepository(request.server.prisma));
}

export async function agendarPartidaHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = request.params as CampeonatoParams;
  const body = request.body as AgendarPartidaBody;
  const partida = await service(request).agendar(params.id, body);
  return reply.status(201).send(partida);
}

export async function listarPartidasDoCampeonatoHandler(
  request: FastifyRequest<{ Params: CampeonatoParams }>,
  reply: FastifyReply,
) {
  const partidas = await service(request).listarPorCampeonato(request.params.id);
  return reply.send(partidas);
}

export async function obterPartidaHandler(
  request: FastifyRequest<{ Params: PartidaParams }>,
  reply: FastifyReply,
) {
  const partida = await service(request).obter(request.params.id);
  return reply.send(partida);
}

export async function lancarResultadoHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = request.params as PartidaParams;
  const body = request.body as LancarResultadoBody;
  const partida = await service(request).lancarResultado(params.id, body);
  return reply.send(partida);
}
