import { NotFoundError } from "../../shared/errors/index.js";
import type { JogadoresRepository } from "./jogadores.repository.js";

export function createJogadoresService(repository: JogadoresRepository) {
  return {
    async obter(id: number) {
      const jogador = await repository.findById(id);
      if (!jogador) {
        throw new NotFoundError("Jogador não encontrado");
      }
      return jogador;
    },
  };
}

export type JogadoresService = ReturnType<typeof createJogadoresService>;
