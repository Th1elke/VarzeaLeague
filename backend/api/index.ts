import type { IncomingMessage, ServerResponse } from "node:http";
import { buildApp } from "../src/app.js";

// Reaproveita a mesma instância do Fastify (e a conexão do Prisma) entre
// invocações "quentes" da função serverless, em vez de recriar tudo a cada
// request.
let app: ReturnType<typeof buildApp> | undefined;

function getApp() {
  if (!app) {
    app = buildApp();
  }
  return app;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const instance = getApp();
  await instance.ready();
  instance.server.emit("request", req, res);
}
