import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { campeonatoParamsSchema } from "../campeonatos/campeonatos.schema.js";
import { obterArtilhariaHandler, obterClassificacaoHandler } from "./classificacao.controller.js";
import { artilhariaResponseSchema, classificacaoResponseSchema } from "./classificacao.schema.js";

export async function classificacaoRoutes(app: FastifyInstance) {
  const router = app.withTypeProvider<ZodTypeProvider>();

  router.get(
    "/campeonatos/:id/classificacao",
    {
      schema: {
        tags: ["classificacao"],
        summary: "Tabela de classificação calculada em tempo real",
        params: campeonatoParamsSchema,
        response: { 200: classificacaoResponseSchema },
      },
    },
    obterClassificacaoHandler,
  );

  router.get(
    "/campeonatos/:id/artilharia",
    {
      schema: {
        tags: ["classificacao"],
        summary: "Ranking de artilheiros do campeonato",
        params: campeonatoParamsSchema,
        response: { 200: artilhariaResponseSchema },
      },
    },
    obterArtilhariaHandler,
  );
}
