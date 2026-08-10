import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";
import { buildTestApp, resetDatabase } from "./helpers.js";

describe("Auth", () => {
  let app: ReturnType<typeof buildApp>;

  beforeAll(async () => {
    app = buildTestApp();
    await app.ready();
  });

  beforeEach(async () => {
    await resetDatabase(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it("registra um novo organizador e retorna um token", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/registro",
      payload: { email: "organizador@teste.com", senha: "senha123" },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.token).toBeTypeOf("string");
    expect(body.usuario.email).toBe("organizador@teste.com");
  });

  it("rejeita registro com email já cadastrado", async () => {
    await app.inject({
      method: "POST",
      url: "/auth/registro",
      payload: { email: "duplicado@teste.com", senha: "senha123" },
    });

    const response = await app.inject({
      method: "POST",
      url: "/auth/registro",
      payload: { email: "duplicado@teste.com", senha: "outrasenha" },
    });

    expect(response.statusCode).toBe(409);
  });

  it("faz login com credenciais válidas", async () => {
    await app.inject({
      method: "POST",
      url: "/auth/registro",
      payload: { email: "login@teste.com", senha: "senha123" },
    });

    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "login@teste.com", senha: "senha123" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().token).toBeTypeOf("string");
  });

  it("rejeita login com senha incorreta", async () => {
    await app.inject({
      method: "POST",
      url: "/auth/registro",
      payload: { email: "senhaerrada@teste.com", senha: "senha123" },
    });

    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "senhaerrada@teste.com", senha: "senhaincorreta" },
    });

    expect(response.statusCode).toBe(401);
  });

  it("bloqueia rotas de organizador sem token", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/times",
      payload: { nome: "Time Teste", sigla: "TST", cidade: "São Paulo" },
    });

    expect(response.statusCode).toBe(401);
  });
});
