import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { loginHandler, registrarHandler } from "./auth.controller.js";
import { authResponseSchema, loginBodySchema, registroBodySchema } from "./auth.schema.js";

export async function authRoutes(app: FastifyInstance) {
  const router = app.withTypeProvider<ZodTypeProvider>();

  router.post(
    "/auth/registro",
    {
      schema: {
        tags: ["auth"],
        summary: "Cria uma conta de organizador",
        body: registroBodySchema,
        response: { 201: authResponseSchema },
      },
    },
    registrarHandler,
  );

  router.post(
    "/auth/login",
    {
      schema: {
        tags: ["auth"],
        summary: "Autentica um organizador e retorna um JWT",
        body: loginBodySchema,
        response: { 200: authResponseSchema },
      },
    },
    loginHandler,
  );
}
