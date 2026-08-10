import type { FastifyReply, FastifyRequest } from "fastify";
import type { CampeonatoParams } from "../campeonatos/campeonatos.schema.js";
import { createParticipacoesRepository } from "./participacoes.repository.js";
import { createParticipacoesService } from "./participacoes.service.js";
import type { InscreverTimeBody } from "./participacoes.schema.js";

export async function inscreverTimeHandler(request: FastifyRequest, reply: FastifyReply) {
  const params = request.params as CampeonatoParams;
  const body = request.body as InscreverTimeBody;
  const service = createParticipacoesService(
    createParticipacoesRepository(request.server.prisma),
  );
  const participacao = await service.inscrever(params.id, body.time_id);
  return reply.status(201).send(participacao);
}
