import { NotFoundError, ValidationAppError } from "../../shared/errors/index.js";
import type { PartidasRepository } from "./partidas.repository.js";
import type { AgendarPartidaBody, LancarResultadoBody } from "./partidas.schema.js";

export function createPartidasService(repository: PartidasRepository) {
  return {
    async agendar(campeonatoId: number, data: AgendarPartidaBody) {
      if (data.time_casa_id === data.time_visitante_id) {
        throw new ValidationAppError("O time da casa e o visitante não podem ser o mesmo");
      }

      const campeonato = await repository.campeonatoExists(campeonatoId);
      if (!campeonato) {
        throw new NotFoundError("Campeonato não encontrado");
      }

      for (const timeId of [data.time_casa_id, data.time_visitante_id]) {
        const inscrito = await repository.participacaoExists(campeonatoId, timeId);
        if (!inscrito) {
          throw new ValidationAppError(
            `Time ${timeId} não está inscrito neste campeonato`,
          );
        }
      }

      return repository.create(campeonatoId, data);
    },

    async obter(id: number) {
      const partida = await repository.findById(id);
      if (!partida) {
        throw new NotFoundError("Partida não encontrada");
      }
      return partida;
    },

    async listarPorCampeonato(campeonatoId: number) {
      const campeonato = await repository.campeonatoExists(campeonatoId);
      if (!campeonato) {
        throw new NotFoundError("Campeonato não encontrado");
      }
      return repository.findByCampeonato(campeonatoId);
    },

    async lancarResultado(id: number, data: LancarResultadoBody) {
      const partida = await repository.findById(id);
      if (!partida) {
        throw new NotFoundError("Partida não encontrada");
      }

      const timesDaPartida = new Set([partida.time_casa_id, partida.time_visitante_id]);

      for (const estatistica of data.estatisticas) {
        const jogador = await repository.findJogadorById(estatistica.jogador_id);
        if (!jogador) {
          throw new ValidationAppError(`Jogador ${estatistica.jogador_id} não encontrado`);
        }
        if (!timesDaPartida.has(jogador.time_id)) {
          throw new ValidationAppError(
            `Jogador ${estatistica.jogador_id} não pertence a nenhum dos times desta partida`,
          );
        }
      }

      return repository.lancarResultado(id, data);
    },
  };
}

export type PartidasService = ReturnType<typeof createPartidasService>;
