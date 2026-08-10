import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    hookTimeout: 30000,
    testTimeout: 30000,
    // Os testes de integração compartilham um único banco Postgres (Neon) e
    // limpam as tabelas entre os testes; rodar arquivos em paralelo causaria
    // corrida entre os resets de diferentes arquivos.
    fileParallelism: false,
  },
});
