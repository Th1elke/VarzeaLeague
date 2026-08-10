import type { PrismaClient } from "@prisma/client";

export function createTimesRepository(prisma: PrismaClient) {
  return {
    findAll() {
      return prisma.time.findMany({ orderBy: { nome: "asc" } });
    },

    findById(id: number) {
      return prisma.time.findUnique({
        where: { id },
        include: { jogadores: true },
      });
    },

    exists(id: number) {
      return prisma.time.findUnique({ where: { id }, select: { id: true } });
    },

    create(data: { nome: string; sigla: string; cidade: string; escudo_url?: string }) {
      return prisma.time.create({ data });
    },

    addJogador(
      timeId: number,
      data: { nome: string; posicao: string; numero_camisa: number },
    ) {
      return prisma.jogador.create({
        data: { ...data, time_id: timeId },
      });
    },
  };
}

export type TimesRepository = ReturnType<typeof createTimesRepository>;
