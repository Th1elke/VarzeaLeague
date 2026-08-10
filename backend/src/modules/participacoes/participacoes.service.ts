import { ConflictError, NotFoundError } from "../../shared/errors/index.js";
import type { ParticipacoesRepository } from "./participacoes.repository.js";

export function createParticipacoesService(repository: ParticipacoesRepository) {
  return {
    async inscrever(campeonatoId: number, timeId: number) {
      const campeonato = await repository.campeonatoExists(campeonatoId);
      if (!campeonato) {
        throw new NotFoundError("Campeonato não encontrado");
      }

      const time = await repository.timeExists(timeId);
      if (!time) {
        throw new NotFoundError("Time não encontrado");
      }

      const jaInscrito = await repository.findOne(campeonatoId, timeId);
      if (jaInscrito) {
        throw new ConflictError("Time já está inscrito neste campeonato");
      }

      return repository.create(campeonatoId, timeId);
    },
  };
}

export type ParticipacoesService = ReturnType<typeof createParticipacoesService>;
