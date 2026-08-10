import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { inscreverTimeHandler } from "../participacoes/participacoes.controller.js";
import { inscreverTimeBodySchema, participacaoResponseSchema } from "../participacoes/participacoes.schema.js";
import {
  criarCampeonatoHandler,
  listarCampeonatosHandler,
  obterCampeonatoHandler,
} from "./campeonatos.controller.js";
import {
  campeonatoDetalheResponseSchema,
  campeonatoParamsSchema,
  campeonatoResponseSchema,
  criarCampeonatoBodySchema,
  listaCampeonatosResponseSchema,
} from "./campeonatos.schema.js";

export async function campeonatosRoutes(app: FastifyInstance) {
  const router = app.withTypeProvider<ZodTypeProvider>();

  router.get(
    "/campeonatos",
    {
      schema: {
        tags: ["campeonatos"],
        summary: "Lista todos os campeonatos",
        response: { 200: listaCampeonatosResponseSchema },
      },
    },
    listarCampeonatosHandler,
  );

  router.get(
    "/campeonatos/:id",
    {
      schema: {
        tags: ["campeonatos"],
        summary: "Detalhe do campeonato, com times participantes",
        params: campeonatoParamsSchema,
        response: { 200: campeonatoDetalheResponseSchema },
      },
    },
    obterCampeonatoHandler,
  );

  router.post(
    "/campeonatos",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["campeonatos"],
        summary: "Cria um novo campeonato",
        security: [{ bearerAuth: [] }],
        body: criarCampeonatoBodySchema,
        response: { 201: campeonatoResponseSchema },
      },
    },
    criarCampeonatoHandler,
  );

  router.post(
    "/campeonatos/:id/times",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["campeonatos"],
        summary: "Inscreve um time no campeonato",
        security: [{ bearerAuth: [] }],
        params: campeonatoParamsSchema,
        body: inscreverTimeBodySchema,
        response: { 201: participacaoResponseSchema },
      },
    },
    inscreverTimeHandler,
  );
}
