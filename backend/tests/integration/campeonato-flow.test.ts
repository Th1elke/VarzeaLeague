import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";
import { buildTestApp, resetDatabase } from "./helpers.js";

describe("Fluxo completo de campeonato", () => {
  let app: ReturnType<typeof buildApp>;
  let token: string;

  beforeAll(async () => {
    app = buildTestApp();
    await app.ready();
  });

  beforeEach(async () => {
    await resetDatabase(app);

    const registro = await app.inject({
      method: "POST",
      url: "/auth/registro",
      payload: { email: "organizador@teste.com", senha: "senha123" },
    });
    token = registro.json().token;
  });

  afterAll(async () => {
    await app.close();
  });

  function auth() {
    return { authorization: `Bearer ${token}` };
  }

  it("cria times, campeonato, inscreve times, lança resultados e calcula a classificação e artilharia", async () => {
    const timeA = await app.inject({
      method: "POST",
      url: "/times",
      headers: auth(),
      payload: { nome: "Time A", sigla: "TMA", cidade: "São Paulo" },
    });
    const timeB = await app.inject({
      method: "POST",
      url: "/times",
      headers: auth(),
      payload: { nome: "Time B", sigla: "TMB", cidade: "São Paulo" },
    });
    expect(timeA.statusCode).toBe(201);
    expect(timeB.statusCode).toBe(201);
    const timeAId = timeA.json().id;
    const timeBId = timeB.json().id;

    const jogadorA = await app.inject({
      method: "POST",
      url: `/times/${timeAId}/jogadores`,
      headers: auth(),
      payload: { nome: "Artilheiro A", posicao: "Atacante", numero_camisa: 9 },
    });
    expect(jogadorA.statusCode).toBe(201);
    const jogadorAId = jogadorA.json().id;

    const campeonato = await app.inject({
      method: "POST",
      url: "/campeonatos",
      headers: auth(),
      payload: { nome: "Copa Teste", temporada: "2026" },
    });
    expect(campeonato.statusCode).toBe(201);
    const campeonatoId = campeonato.json().id;

    const inscricaoA = await app.inject({
      method: "POST",
      url: `/campeonatos/${campeonatoId}/times`,
      headers: auth(),
      payload: { time_id: timeAId },
    });
    const inscricaoB = await app.inject({
      method: "POST",
      url: `/campeonatos/${campeonatoId}/times`,
      headers: auth(),
      payload: { time_id: timeBId },
    });
    expect(inscricaoA.statusCode).toBe(201);
    expect(inscricaoB.statusCode).toBe(201);

    const inscricaoDuplicada = await app.inject({
      method: "POST",
      url: `/campeonatos/${campeonatoId}/times`,
      headers: auth(),
      payload: { time_id: timeAId },
    });
    expect(inscricaoDuplicada.statusCode).toBe(409);

    const partida = await app.inject({
      method: "POST",
      url: `/campeonatos/${campeonatoId}/partidas`,
      headers: auth(),
      payload: {
        time_casa_id: timeAId,
        time_visitante_id: timeBId,
        data: new Date().toISOString(),
        rodada: 1,
      },
    });
    expect(partida.statusCode).toBe(201);
    const partidaId = partida.json().id;

    const resultado = await app.inject({
      method: "PATCH",
      url: `/partidas/${partidaId}`,
      headers: auth(),
      payload: {
        gols_casa: 2,
        gols_visitante: 1,
        estatisticas: [{ jogador_id: jogadorAId, gols: 2 }],
      },
    });
    expect(resultado.statusCode).toBe(200);
    expect(resultado.json().status).toBe("ENCERRADA");

    const classificacao = await app.inject({
      method: "GET",
      url: `/campeonatos/${campeonatoId}/classificacao`,
    });
    expect(classificacao.statusCode).toBe(200);
    const tabela = classificacao.json();
    expect(tabela[0].time_id).toBe(timeAId);
    expect(tabela[0].pontos).toBe(3);
    expect(tabela[0].saldo_gols).toBe(1);
    expect(tabela[1].time_id).toBe(timeBId);
    expect(tabela[1].pontos).toBe(0);

    const artilharia = await app.inject({
      method: "GET",
      url: `/campeonatos/${campeonatoId}/artilharia`,
    });
    expect(artilharia.statusCode).toBe(200);
    const ranking = artilharia.json();
    expect(ranking).toHaveLength(1);
    expect(ranking[0]).toMatchObject({ jogador_id: jogadorAId, gols: 2 });
  });

  it("rejeita agendar partida com time não inscrito no campeonato", async () => {
    const timeA = await app.inject({
      method: "POST",
      url: "/times",
      headers: auth(),
      payload: { nome: "Time A", sigla: "TMA", cidade: "São Paulo" },
    });
    const timeB = await app.inject({
      method: "POST",
      url: "/times",
      headers: auth(),
      payload: { nome: "Time B", sigla: "TMB", cidade: "São Paulo" },
    });

    const campeonato = await app.inject({
      method: "POST",
      url: "/campeonatos",
      headers: auth(),
      payload: { nome: "Copa Teste", temporada: "2026" },
    });
    const campeonatoId = campeonato.json().id;

    await app.inject({
      method: "POST",
      url: `/campeonatos/${campeonatoId}/times`,
      headers: auth(),
      payload: { time_id: timeA.json().id },
    });

    const partida = await app.inject({
      method: "POST",
      url: `/campeonatos/${campeonatoId}/partidas`,
      headers: auth(),
      payload: {
        time_casa_id: timeA.json().id,
        time_visitante_id: timeB.json().id,
        data: new Date().toISOString(),
        rodada: 1,
      },
    });

    expect(partida.statusCode).toBe(400);
  });
});
