-- CreateEnum
CREATE TYPE "FormatoCampeonato" AS ENUM ('PONTOS_CORRIDOS', 'MATA_MATA', 'GRUPOS');

-- CreateEnum
CREATE TYPE "StatusCampeonato" AS ENUM ('NAO_INICIADO', 'EM_ANDAMENTO', 'ENCERRADO');

-- CreateEnum
CREATE TYPE "StatusPartida" AS ENUM ('AGENDADA', 'ENCERRADA');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "times" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "sigla" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "escudo_url" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "times_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jogadores" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "posicao" TEXT NOT NULL,
    "numero_camisa" INTEGER NOT NULL,

    CONSTRAINT "jogadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campeonatos" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "temporada" TEXT NOT NULL,
    "formato" "FormatoCampeonato" NOT NULL DEFAULT 'PONTOS_CORRIDOS',
    "status" "StatusCampeonato" NOT NULL DEFAULT 'NAO_INICIADO',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campeonatos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participacoes" (
    "id" SERIAL NOT NULL,
    "campeonato_id" INTEGER NOT NULL,
    "time_id" INTEGER NOT NULL,

    CONSTRAINT "participacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partidas" (
    "id" SERIAL NOT NULL,
    "campeonato_id" INTEGER NOT NULL,
    "time_casa_id" INTEGER NOT NULL,
    "time_visitante_id" INTEGER NOT NULL,
    "gols_casa" INTEGER,
    "gols_visitante" INTEGER,
    "data" TIMESTAMP(3) NOT NULL,
    "rodada" INTEGER NOT NULL,
    "status" "StatusPartida" NOT NULL DEFAULT 'AGENDADA',

    CONSTRAINT "partidas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estatisticas_jogador_partida" (
    "id" SERIAL NOT NULL,
    "partida_id" INTEGER NOT NULL,
    "jogador_id" INTEGER NOT NULL,
    "gols" INTEGER NOT NULL DEFAULT 0,
    "cartoes_amarelos" INTEGER NOT NULL DEFAULT 0,
    "cartoes_vermelhos" INTEGER NOT NULL DEFAULT 0,
    "assistencias" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "estatisticas_jogador_partida_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "participacoes_campeonato_id_time_id_key" ON "participacoes"("campeonato_id", "time_id");

-- CreateIndex
CREATE UNIQUE INDEX "estatisticas_jogador_partida_partida_id_jogador_id_key" ON "estatisticas_jogador_partida"("partida_id", "jogador_id");

-- AddForeignKey
ALTER TABLE "jogadores" ADD CONSTRAINT "jogadores_time_id_fkey" FOREIGN KEY ("time_id") REFERENCES "times"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participacoes" ADD CONSTRAINT "participacoes_campeonato_id_fkey" FOREIGN KEY ("campeonato_id") REFERENCES "campeonatos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participacoes" ADD CONSTRAINT "participacoes_time_id_fkey" FOREIGN KEY ("time_id") REFERENCES "times"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidas" ADD CONSTRAINT "partidas_campeonato_id_fkey" FOREIGN KEY ("campeonato_id") REFERENCES "campeonatos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidas" ADD CONSTRAINT "partidas_time_casa_id_fkey" FOREIGN KEY ("time_casa_id") REFERENCES "times"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidas" ADD CONSTRAINT "partidas_time_visitante_id_fkey" FOREIGN KEY ("time_visitante_id") REFERENCES "times"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estatisticas_jogador_partida" ADD CONSTRAINT "estatisticas_jogador_partida_partida_id_fkey" FOREIGN KEY ("partida_id") REFERENCES "partidas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estatisticas_jogador_partida" ADD CONSTRAINT "estatisticas_jogador_partida_jogador_id_fkey" FOREIGN KEY ("jogador_id") REFERENCES "jogadores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
