import { z } from "zod";

export const linhaClassificacaoSchema = z.object({
  time_id: z.number(),
  nome: z.string(),
  sigla: z.string(),
  jogos: z.number(),
  vitorias: z.number(),
  empates: z.number(),
  derrotas: z.number(),
  gols_pro: z.number(),
  gols_contra: z.number(),
  saldo_gols: z.number(),
  pontos: z.number(),
});

export const classificacaoResponseSchema = z.array(linhaClassificacaoSchema);

export const linhaArtilhariaSchema = z.object({
  jogador_id: z.number(),
  nome: z.string(),
  time: z.object({ id: z.number(), nome: z.string(), sigla: z.string() }),
  gols: z.number(),
});

export const artilhariaResponseSchema = z.array(linhaArtilhariaSchema);
