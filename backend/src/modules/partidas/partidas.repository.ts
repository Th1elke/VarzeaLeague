import type { PrismaClient } from "@prisma/client";

const partidaDetalheInclude = {
  timeCasa: { select: { id: true, nome: true, sigla: true } },
  timeVisitante: { select: { id: true, nome: true, sigla: true } },
  estatisticas: {
    include: { jogador: { select: { id: true, nome: true } } },
  },
} as const;

export function createPartidasRepository(prisma: PrismaClient) {
  return {
    campeonatoExists(campeonatoId: number) {
      return prisma.campeonato.findUnique({ where: { id: campeonatoId }, select: { id: true } });
    },

    findTimeById(timeId: number) {
      return prisma.time.findUnique({ where: { id: timeId }, select: { id: true } });
    },

    participacaoExists(campeonatoId: number, timeId: number) {
      return prisma.participacao.findUnique({
        where: { campeonato_id_time_id: { campeonato_id: campeonatoId, time_id: timeId } },
      });
    },

    findJogadorById(jogadorId: number) {
      return prisma.jogador.findUnique({
        where: { id: jogadorId },
        select: { id: true, time_id: true },
      });
    },

    create(
      campeonatoId: number,
      data: { time_casa_id: number; time_visitante_id: number; data: Date; rodada: number },
    ) {
      return prisma.partida.create({
        data: { ...data, campeonato_id: campeonatoId },
      });
    },

    findById(id: number) {
      return prisma.partida.findUnique({
        where: { id },
        include: partidaDetalheInclude,
      });
    },

    findByCampeonato(campeonatoId: number) {
      return prisma.partida.findMany({
        where: { campeonato_id: campeonatoId },
        orderBy: [{ rodada: "asc" }, { data: "asc" }],
      });
    },

    findEncerradasByCampeonato(campeonatoId: number) {
      return prisma.partida.findMany({
        where: { campeonato_id: campeonatoId, status: "ENCERRADA" },
      });
    },

    async lancarResultado(
      id: number,
      data: {
        gols_casa: number;
        gols_visitante: number;
        estatisticas: Array<{
          jogador_id: number;
          gols: number;
          cartoes_amarelos: number;
          cartoes_vermelhos: number;
          assistencias: number;
        }>;
      },
    ) {
      return prisma.$transaction(async (tx) => {
        await tx.estatisticaJogadorPartida.deleteMany({ where: { partida_id: id } });

        const partida = await tx.partida.update({
          where: { id },
          data: {
            gols_casa: data.gols_casa,
            gols_visitante: data.gols_visitante,
            status: "ENCERRADA",
            estatisticas: {
              create: data.estatisticas.map((e) => ({
                jogador_id: e.jogador_id,
                gols: e.gols,
                cartoes_amarelos: e.cartoes_amarelos,
                cartoes_vermelhos: e.cartoes_vermelhos,
                assistencias: e.assistencias,
              })),
            },
          },
          include: partidaDetalheInclude,
        });

        return partida;
      });
    },
  };
}

export type PartidasRepository = ReturnType<typeof createPartidasRepository>;
