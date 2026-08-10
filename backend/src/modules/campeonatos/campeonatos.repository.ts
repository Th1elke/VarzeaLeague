import type { PrismaClient } from "@prisma/client";

export function createCampeonatosRepository(prisma: PrismaClient) {
  return {
    findAll() {
      return prisma.campeonato.findMany({ orderBy: { criado_em: "desc" } });
    },

    findById(id: number) {
      return prisma.campeonato.findUnique({
        where: { id },
        include: {
          participacoes: {
            include: { time: { select: { id: true, nome: true, sigla: true } } },
          },
        },
      });
    },

    exists(id: number) {
      return prisma.campeonato.findUnique({ where: { id }, select: { id: true } });
    },

    create(data: { nome: string; temporada: string; formato: "PONTOS_CORRIDOS" }) {
      return prisma.campeonato.create({ data });
    },
  };
}

export type CampeonatosRepository = ReturnType<typeof createCampeonatosRepository>;
