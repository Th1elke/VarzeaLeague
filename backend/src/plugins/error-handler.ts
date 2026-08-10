import fp from "fastify-plugin";
import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { AppError } from "../shared/errors/index.js";

export const errorHandlerPlugin = fp(async (app: FastifyInstance) => {
  app.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: error.code,
        message: error.message,
      });
    }

    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: "Dados inválidos",
        issues: error.flatten(),
      });
    }

    // Erros de validação de schema (query/params/body) gerados pelo fastify-type-provider-zod
    if (error.validation) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: "Dados inválidos",
        issues: error.validation,
      });
    }

    request.log.error(error);

    return reply.status(500).send({
      error: "INTERNAL_SERVER_ERROR",
      message: "Erro interno do servidor",
    });
  });
});
