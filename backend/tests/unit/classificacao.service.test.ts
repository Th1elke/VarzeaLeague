import { describe, expect, it } from "vitest";
import {
  calcularArtilharia,
  calcularClassificacao,
  type PartidaEncerrada,
  type TimeParticipante,
} from "../../src/modules/classificacao/classificacao.service.js";

const timeA: TimeParticipante = { id: 1, nome: "Time A", sigla: "TMA" };
const timeB: TimeParticipante = { id: 2, nome: "Time B", sigla: "TMB" };
const timeC: TimeParticipante = { id: 3, nome: "Time C", sigla: "TMC" };

function partida(
  timeCasaId: number,
  golsCasa: number,
  timeVisitanteId: number,
  golsVisitante: number,
): PartidaEncerrada {
  return {
    time_casa_id: timeCasaId,
    gols_casa: golsCasa,
    time_visitante_id: timeVisitanteId,
    gols_visitante: golsVisitante,
  };
}

describe("calcularClassificacao", () => {
  it("ordena os times por pontos (vitória = 3, empate = 1, derrota = 0)", () => {
    const partidas = [
      partida(timeA.id, 2, timeB.id, 0), // A vence
      partida(timeA.id, 1, timeC.id, 1), // A empata
      partida(timeB.id, 1, timeC.id, 2), // C vence
    ];

    const tabela = calcularClassificacao([timeA, timeB, timeC], partidas);

    expect(tabela.map((l) => l.time_id)).toEqual([timeA.id, timeC.id, timeB.id]);
    expect(tabela[0].pontos).toBe(4);
    expect(tabela[0].vitorias).toBe(1);
    expect(tabela[0].empates).toBe(1);
  });

  it("desempata por saldo de gols quando os pontos são iguais", () => {
    const partidas = [
      partida(timeA.id, 3, timeC.id, 0), // A: saldo +3, 3 pts
      partida(timeB.id, 1, timeC.id, 0), // B: saldo +1, 3 pts
    ];

    const tabela = calcularClassificacao([timeA, timeB], partidas);

    expect(tabela[0].time_id).toBe(timeA.id);
    expect(tabela[0].saldo_gols).toBe(3);
    expect(tabela[1].time_id).toBe(timeB.id);
    expect(tabela[1].saldo_gols).toBe(1);
  });

  it("desempata por gols pró quando pontos e saldo de gols são iguais", () => {
    const partidas = [
      partida(timeA.id, 1, timeC.id, 0), // A: 3 pts, saldo +1, pro 1
      partida(timeB.id, 2, timeC.id, 1), // B: 3 pts, saldo +1, pro 2
    ];

    const tabela = calcularClassificacao([timeA, timeB], partidas);

    expect(tabela[0].time_id).toBe(timeB.id);
    expect(tabela[0].gols_pro).toBe(2);
    expect(tabela[1].time_id).toBe(timeA.id);
    expect(tabela[1].gols_pro).toBe(1);
  });

  it("desempata por confronto direto quando pontos, saldo e gols pró são iguais", () => {
    const partidas = [
      partida(timeA.id, 1, timeB.id, 0), // confronto direto: A vence B
      partida(timeC.id, 1, timeA.id, 0), // A perde para C
      partida(timeB.id, 1, timeC.id, 0), // B vence C
    ];

    const tabela = calcularClassificacao([timeA, timeB], partidas);

    // A e B têm, cada um: 1 jogo (fora o confronto direto), 3 pontos, saldo 0, pro 1
    expect(tabela[0].pontos).toBe(tabela[1].pontos);
    expect(tabela[0].saldo_gols).toBe(tabela[1].saldo_gols);
    expect(tabela[0].gols_pro).toBe(tabela[1].gols_pro);

    // A vence o confronto direto, então fica na frente
    expect(tabela[0].time_id).toBe(timeA.id);
    expect(tabela[1].time_id).toBe(timeB.id);
  });
});

describe("calcularArtilharia", () => {
  it("soma os gols do jogador em todas as partidas e ordena do maior para o menor", () => {
    const estatisticas = [
      {
        jogador_id: 10,
        gols: 2,
        jogador: { id: 10, nome: "Jogador X", time: { id: 1, nome: "Time A", sigla: "TMA" } },
      },
      {
        jogador_id: 11,
        gols: 3,
        jogador: { id: 11, nome: "Jogador Y", time: { id: 2, nome: "Time B", sigla: "TMB" } },
      },
      {
        jogador_id: 10,
        gols: 1,
        jogador: { id: 10, nome: "Jogador X", time: { id: 1, nome: "Time A", sigla: "TMA" } },
      },
      {
        jogador_id: 12,
        gols: 0,
        jogador: { id: 12, nome: "Jogador Z", time: { id: 2, nome: "Time B", sigla: "TMB" } },
      },
    ];

    const ranking = calcularArtilharia(estatisticas);

    expect(ranking).toHaveLength(2);
    // ambos somam 3 gols; empate desfeito por ordem alfabética do nome
    expect(ranking[0]).toMatchObject({ jogador_id: 10, gols: 3 });
    expect(ranking[1]).toMatchObject({ jogador_id: 11, gols: 3 });
  });
});
