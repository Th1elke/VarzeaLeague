import type { PrismaClient } from "@prisma/client";

export function createClassificacaoRepository(prisma: PrismaClient) {
  return {
    campeonatoExists(campeonatoId: number) {
      return prisma.campeonato.findUnique({ where: { id: campeonatoId }, select: { id: true } });
    },

    async findParticipantes(campeonatoId: number) {
      const participacoes = await prisma.participacao.findMany({
        where: { campeonato_id: campeonatoId },
        include: { time: { select: { id: true, nome: true, sigla: true } } },
      });
      return participacoes.map((p) => p.time);
    },

    findPartidasEncerradas(campeonatoId: number) {
      return prisma.partida.findMany({
        where: { campeonato_id: campeonatoId, status: "ENCERRADA" },
        select: {
          time_casa_id: true,
          time_visitante_id: true,
          gols_casa: true,
          gols_visitante: true,
        },
      });
    },

    findEstatisticasDoCampeonato(campeonatoId: number) {
      return prisma.estatisticaJogadorPartida.findMany({
        where: { partida: { campeonato_id: campeonatoId } },
        select: {
          jogador_id: true,
          gols: true,
          jogador: {
            select: {
              id: true,
              nome: true,
              time: { select: { id: true, nome: true, sigla: true } },
            },
          },
        },
      });
    },
  };
}

export type ClassificacaoRepository = ReturnType<typeof createClassificacaoRepository>;
