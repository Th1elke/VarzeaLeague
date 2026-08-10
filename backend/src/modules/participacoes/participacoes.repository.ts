import type { PrismaClient } from "@prisma/client";

export function createParticipacoesRepository(prisma: PrismaClient) {
  return {
    campeonatoExists(campeonatoId: number) {
      return prisma.campeonato.findUnique({ where: { id: campeonatoId }, select: { id: true } });
    },

    timeExists(timeId: number) {
      return prisma.time.findUnique({ where: { id: timeId }, select: { id: true } });
    },

    findOne(campeonatoId: number, timeId: number) {
      return prisma.participacao.findUnique({
        where: { campeonato_id_time_id: { campeonato_id: campeonatoId, time_id: timeId } },
      });
    },

    create(campeonatoId: number, timeId: number) {
      return prisma.participacao.create({
        data: { campeonato_id: campeonatoId, time_id: timeId },
      });
    },
  };
}

export type ParticipacoesRepository = ReturnType<typeof createParticipacoesRepository>;
