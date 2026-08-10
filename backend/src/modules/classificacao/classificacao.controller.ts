import type { FastifyReply, FastifyRequest } from "fastify";
import { NotFoundError } from "../../shared/errors/index.js";
import type { CampeonatoParams } from "../campeonatos/campeonatos.schema.js";
import { createClassificacaoRepository } from "./classificacao.repository.js";
import { calcularArtilharia, calcularClassificacao } from "./classificacao.service.js";

export async function obterClassificacaoHandler(
  request: FastifyRequest<{ Params: CampeonatoParams }>,
  reply: FastifyReply,
) {
  const repository = createClassificacaoRepository(request.server.prisma);
  const campeonatoId = request.params.id;

  const campeonato = await repository.campeonatoExists(campeonatoId);
  if (!campeonato) {
    throw new NotFoundError("Campeonato não encontrado");
  }

  const [times, partidas] = await Promise.all([
    repository.findParticipantes(campeonatoId),
    repository.findPartidasEncerradas(campeonatoId),
  ]);

  const partidasValidas = partidas
    .filter((p) => p.gols_casa !== null && p.gols_visitante !== null)
    .map((p) => ({
      time_casa_id: p.time_casa_id,
      time_visitante_id: p.time_visitante_id,
      gols_casa: p.gols_casa as number,
      gols_visitante: p.gols_visitante as number,
    }));

  const classificacao = calcularClassificacao(times, partidasValidas);
  return reply.send(classificacao);
}

export async function obterArtilhariaHandler(
  request: FastifyRequest<{ Params: CampeonatoParams }>,
  reply: FastifyReply,
) {
  const repository = createClassificacaoRepository(request.server.prisma);
  const campeonatoId = request.params.id;

  const campeonato = await repository.campeonatoExists(campeonatoId);
  if (!campeonato) {
    throw new NotFoundError("Campeonato não encontrado");
  }

  const estatisticas = await repository.findEstatisticasDoCampeonato(campeonatoId);
  const artilharia = calcularArtilharia(estatisticas);
  return reply.send(artilharia);
}
