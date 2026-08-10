import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { campeonatoParamsSchema } from "../campeonatos/campeonatos.schema.js";
import {
  agendarPartidaHandler,
  lancarResultadoHandler,
  listarPartidasDoCampeonatoHandler,
  obterPartidaHandler,
} from "./partidas.controller.js";
import {
  agendarPartidaBodySchema,
  lancarResultadoBodySchema,
  listaPartidasResponseSchema,
  partidaDetalheResponseSchema,
  partidaParamsSchema,
  partidaResponseSchema,
} from "./partidas.schema.js";

export async function partidasRoutes(app: FastifyInstance) {
  const router = app.withTypeProvider<ZodTypeProvider>();

  router.post(
    "/campeonatos/:id/partidas",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["partidas"],
        summary: "Agenda uma partida no campeonato",
        security: [{ bearerAuth: [] }],
        params: campeonatoParamsSchema,
        body: agendarPartidaBodySchema,
        response: { 201: partidaResponseSchema },
      },
    },
    agendarPartidaHandler,
  );

  router.get(
    "/campeonatos/:id/partidas",
    {
      schema: {
        tags: ["partidas"],
        summary: "Lista as partidas do campeonato",
        params: campeonatoParamsSchema,
        response: { 200: listaPartidasResponseSchema },
      },
    },
    listarPartidasDoCampeonatoHandler,
  );

  router.get(
    "/partidas/:id",
    {
      schema: {
        tags: ["partidas"],
        summary: "Detalhe da partida, com estatísticas",
        params: partidaParamsSchema,
        response: { 200: partidaDetalheResponseSchema },
      },
    },
    obterPartidaHandler,
  );

  router.patch(
    "/partidas/:id",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["partidas"],
        summary: "Lança ou corrige o resultado de uma partida",
        security: [{ bearerAuth: [] }],
        params: partidaParamsSchema,
        body: lancarResultadoBodySchema,
        response: { 200: partidaDetalheResponseSchema },
      },
    },
    lancarResultadoHandler,
  );
}
