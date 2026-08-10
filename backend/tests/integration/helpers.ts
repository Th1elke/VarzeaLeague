import { buildApp } from "../../src/app.js";

export function buildTestApp() {
  return buildApp();
}

export async function resetDatabase(app: ReturnType<typeof buildApp>) {
  const { prisma } = app;
  await prisma.estatisticaJogadorPartida.deleteMany();
  await prisma.partida.deleteMany();
  await prisma.participacao.deleteMany();
  await prisma.jogador.deleteMany();
  await prisma.campeonato.deleteMany();
  await prisma.time.deleteMany();
  await prisma.usuario.deleteMany();
}
