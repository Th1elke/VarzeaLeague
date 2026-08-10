import type { PrismaClient } from "@prisma/client";

export function createJogadoresRepository(prisma: PrismaClient) {
  return {
    findById(id: number) {
      return prisma.jogador.findUnique({
        where: { id },
        include: { time: { select: { id: true, nome: true, sigla: true } } },
      });
    },
  };
}

export type JogadoresRepository = ReturnType<typeof createJogadoresRepository>;
