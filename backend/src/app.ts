import Fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { env } from "./config/env.js";
import { corsPlugin } from "./plugins/cors.js";
import { errorHandlerPlugin } from "./plugins/error-handler.js";
import { jwtPlugin } from "./plugins/jwt.js";
import { prismaPlugin } from "./plugins/prisma.js";
import { swaggerPlugin } from "./plugins/swagger.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { campeonatosRoutes } from "./modules/campeonatos/campeonatos.routes.js";
import { classificacaoRoutes } from "./modules/classificacao/classificacao.routes.js";
import { jogadoresRoutes } from "./modules/jogadores/jogadores.routes.js";
import { partidasRoutes } from "./modules/partidas/partidas.routes.js";
import { timesRoutes } from "./modules/times/times.routes.js";

export function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "test" ? "silent" : "info",
    },
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(errorHandlerPlugin);
  app.register(corsPlugin);
  app.register(prismaPlugin);
  app.register(jwtPlugin);
  app.register(swaggerPlugin);

  app.register(authRoutes);
  app.register(timesRoutes);
  app.register(jogadoresRoutes);
  app.register(campeonatosRoutes);
  app.register(partidasRoutes);
  app.register(classificacaoRoutes);

  app.get("/health", async () => ({ status: "ok" }));

  return app;
}
