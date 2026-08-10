import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { obterJogadorHandler } from "./jogadores.controller.js";
import { jogadorComTimeResponseSchema, jogadorParamsSchema } from "./jogadores.schema.js";

export async function jogadoresRoutes(app: FastifyInstance) {
  const router = app.withTypeProvider<ZodTypeProvider>();

  router.get(
    "/jogadores/:id",
    {
      schema: {
        tags: ["jogadores"],
        summary: "Detalhe do jogador",
        params: jogadorParamsSchema,
        response: { 200: jogadorComTimeResponseSchema },
      },
    },
    obterJogadorHandler,
  );
}
