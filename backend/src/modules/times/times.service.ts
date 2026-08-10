import { NotFoundError } from "../../shared/errors/index.js";
import type { TimesRepository } from "./times.repository.js";

export function createTimesService(repository: TimesRepository) {
  return {
    listar() {
      return repository.findAll();
    },

    async obter(id: number) {
      const time = await repository.findById(id);
      if (!time) {
        throw new NotFoundError("Time não encontrado");
      }
      return time;
    },

    criar(data: { nome: string; sigla: string; cidade: string; escudo_url?: string }) {
      return repository.create(data);
    },

    async adicionarJogador(
      timeId: number,
      data: { nome: string; posicao: string; numero_camisa: number },
    ) {
      const time = await repository.exists(timeId);
      if (!time) {
        throw new NotFoundError("Time não encontrado");
      }
      return repository.addJogador(timeId, data);
    },
  };
}

export type TimesService = ReturnType<typeof createTimesService>;
