import type { PrismaClient } from "@prisma/client";

export function createAuthRepository(prisma: PrismaClient) {
  return {
    findByEmail(email: string) {
      return prisma.usuario.findUnique({ where: { email } });
    },

    create(email: string, senhaHash: string) {
      return prisma.usuario.create({
        data: { email, senha_hash: senhaHash },
      });
    },
  };
}

export type AuthRepository = ReturnType<typeof createAuthRepository>;
