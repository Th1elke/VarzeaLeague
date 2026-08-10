import { NotFoundError } from "../../shared/errors/index.js";
import type { CampeonatosRepository } from "./campeonatos.repository.js";

export function createCampeonatosService(repository: CampeonatosRepository) {
  return {
    listar() {
      return repository.findAll();
    },

    async obter(id: number) {
      const campeonato = await repository.findById(id);
      if (!campeonato) {
        throw new NotFoundError("Campeonato não encontrado");
      }

      return {
        id: campeonato.id,
        nome: campeonato.nome,
        temporada: campeonato.temporada,
        formato: campeonato.formato,
        status: campeonato.status,
        times: campeonato.participacoes.map((p) => p.time),
      };
    },

    criar(data: { nome: string; temporada: string; formato: "PONTOS_CORRIDOS" }) {
      return repository.create(data);
    },
  };
}

export type CampeonatosService = ReturnType<typeof createCampeonatosService>;
