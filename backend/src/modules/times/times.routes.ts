import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { criarJogadorBodySchema, jogadorResponseSchema } from "../jogadores/jogadores.schema.js";
import {
  adicionarJogadorHandler,
  criarTimeHandler,
  listarTimesHandler,
  obterTimeHandler,
} from "./times.controller.js";
import {
  criarTimeBodySchema,
  listaTimesResponseSchema,
  timeComElencoResponseSchema,
  timeParamsSchema,
  timeResponseSchema,
} from "./times.schema.js";

export async function timesRoutes(app: FastifyInstance) {
  const router = app.withTypeProvider<ZodTypeProvider>();

  router.get(
    "/times",
    {
      schema: {
        tags: ["times"],
        summary: "Lista todos os times",
        response: { 200: listaTimesResponseSchema },
      },
    },
    listarTimesHandler,
  );

  router.get(
    "/times/:id",
    {
      schema: {
        tags: ["times"],
        summary: "Detalhe do time, com elenco",
        params: timeParamsSchema,
        response: { 200: timeComElencoResponseSchema },
      },
    },
    obterTimeHandler,
  );

  router.post(
    "/times",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["times"],
        summary: "Cria um novo time",
        security: [{ bearerAuth: [] }],
        body: criarTimeBodySchema,
        response: { 201: timeResponseSchema },
      },
    },
    criarTimeHandler,
  );

  router.post(
    "/times/:id/jogadores",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["times"],
        summary: "Adiciona um jogador ao elenco do time",
        security: [{ bearerAuth: [] }],
        params: timeParamsSchema,
        body: criarJogadorBodySchema,
        response: { 201: jogadorResponseSchema },
      },
    },
    adicionarJogadorHandler,
  );
}
