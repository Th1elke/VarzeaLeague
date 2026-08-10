import type { FastifyReply, FastifyRequest } from "fastify";
import { createTimesRepository } from "./times.repository.js";
import { createTimesService } from "./times.service.js";
import type { CriarTimeBody, TimeParams } from "./times.schema.js";

function service(request: FastifyRequest) {
  return createTimesService(createTimesRepository(request.server.prisma));
}

export async function listarTimesHandler(request: FastifyRequest, reply: FastifyReply) {
  const times = await service(request).listar();
  return reply.send(times);
}

export async function obterTimeHandler(
  request: FastifyRequest<{ Params: TimeParams }>,
  reply: FastifyReply,
) {
  const time = await service(request).obter(request.params.id);
  return reply.send(time);
}

export async function criarTimeHandler(request: FastifyRequest, reply: FastifyReply) {
  const body = request.body as CriarTimeBody;
  const time = await service(request).criar(body);
  return reply.status(201).send(time);
}

export async function adicionarJogadorHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = request.params as TimeParams;
  const body = request.body as { nome: string; posicao: string; numero_camisa: number };
  const jogador = await service(request).adicionarJogador(params.id, body);
  return reply.status(201).send(jogador);
}
