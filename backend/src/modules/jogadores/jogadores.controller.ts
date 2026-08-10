import type { FastifyReply, FastifyRequest } from "fastify";
import { createJogadoresRepository } from "./jogadores.repository.js";
import { createJogadoresService } from "./jogadores.service.js";
import type { JogadorParams } from "./jogadores.schema.js";

export async function obterJogadorHandler(
  request: FastifyRequest<{ Params: JogadorParams }>,
  reply: FastifyReply,
) {
  const service = createJogadoresService(createJogadoresRepository(request.server.prisma));
  const jogador = await service.obter(request.params.id);
  return reply.send(jogador);
}
