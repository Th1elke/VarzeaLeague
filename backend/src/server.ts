import { buildApp } from "./app.js";
import { env } from "./config/env.js";

const app = buildApp();

app
  .listen({ port: env.PORT, host: "0.0.0.0" })
  .then(() => {
    app.log.info(`Servidor rodando na porta ${env.PORT}`);
    app.log.info(`Documentação disponível em http://localhost:${env.PORT}/docs`);
  })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
