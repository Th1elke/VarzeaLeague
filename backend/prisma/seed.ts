import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash("senha123", 10);
  await prisma.usuario.upsert({
    where: { email: "organizador@varzealeague.com" },
    update: {},
    create: { email: "organizador@varzealeague.com", senha_hash: senhaHash },
  });

  const [flamengo, corinthians, gremio] = await Promise.all([
    prisma.time.create({ data: { nome: "Flamengo da Vila", sigla: "FLA", cidade: "São Paulo" } }),
    prisma.time.create({ data: { nome: "Corinthians do Bairro", sigla: "COR", cidade: "São Paulo" } }),
    prisma.time.create({ data: { nome: "Grêmio da Praça", sigla: "GRE", cidade: "São Paulo" } }),
  ]);

  await prisma.jogador.createMany({
    data: [
      { time_id: flamengo.id, nome: "João Silva", posicao: "Atacante", numero_camisa: 9 },
      { time_id: corinthians.id, nome: "Pedro Souza", posicao: "Meia", numero_camisa: 10 },
      { time_id: gremio.id, nome: "Lucas Lima", posicao: "Zagueiro", numero_camisa: 4 },
    ],
  });

  const campeonato = await prisma.campeonato.create({
    data: { nome: "Copa da Várzea 2026", temporada: "2026", formato: "PONTOS_CORRIDOS" },
  });

  await prisma.participacao.createMany({
    data: [flamengo, corinthians, gremio].map((time) => ({
      campeonato_id: campeonato.id,
      time_id: time.id,
    })),
  });

  await prisma.partida.create({
    data: {
      campeonato_id: campeonato.id,
      time_casa_id: flamengo.id,
      time_visitante_id: corinthians.id,
      gols_casa: 2,
      gols_visitante: 1,
      data: new Date(),
      rodada: 1,
      status: "ENCERRADA",
    },
  });

  await prisma.partida.create({
    data: {
      campeonato_id: campeonato.id,
      time_casa_id: gremio.id,
      time_visitante_id: flamengo.id,
      data: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      rodada: 2,
      status: "AGENDADA",
    },
  });

  console.log("Seed concluído.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
