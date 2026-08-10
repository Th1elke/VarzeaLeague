import bcrypt from "bcryptjs";
import { ConflictError, UnauthorizedError } from "../../shared/errors/index.js";
import type { AuthRepository } from "./auth.repository.js";

const SALT_ROUNDS = 10;

export function createAuthService(repository: AuthRepository) {
  return {
    async registrar(email: string, senha: string) {
      const existente = await repository.findByEmail(email);
      if (existente) {
        throw new ConflictError("Já existe uma conta cadastrada com este email");
      }

      const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
      const usuario = await repository.create(email, senhaHash);

      return { id: usuario.id, email: usuario.email };
    },

    async login(email: string, senha: string) {
      const usuario = await repository.findByEmail(email);
      if (!usuario) {
        throw new UnauthorizedError("Email ou senha inválidos");
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
      if (!senhaValida) {
        throw new UnauthorizedError("Email ou senha inválidos");
      }

      return { id: usuario.id, email: usuario.email };
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
