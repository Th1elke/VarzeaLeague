import cors from "@fastify/cors";
import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";

export const corsPlugin = fp(async (app: FastifyInstance) => {
  await app.register(cors, {
    origin: true,
  });
});
