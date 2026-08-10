import { z } from "zod";

export const agendarPartidaBodySchema = z.object({
  time_casa_id: z.coerce.number().int().positive(),
  time_visitante_id: z.coerce.number().int().positive(),
  data: z.coerce.date(),
  rodada: z.coerce.number().int().positive(),
});

export const partidaParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const estatisticaJogadorInputSchema = z.object({
  jogador_id: z.coerce.number().int().positive(),
  gols: z.coerce.number().int().min(0).default(0),
  cartoes_amarelos: z.coerce.number().int().min(0).default(0),
  cartoes_vermelhos: z.coerce.number().int().min(0).max(1).default(0),
  assistencias: z.coerce.number().int().min(0).default(0),
});

export const lancarResultadoBodySchema = z.object({
  gols_casa: z.coerce.number().int().min(0),
  gols_visitante: z.coerce.number().int().min(0),
  estatisticas: z.array(estatisticaJogadorInputSchema).default([]),
});

export const partidaResponseSchema = z.object({
  id: z.number(),
  campeonato_id: z.number(),
  time_casa_id: z.number(),
  time_visitante_id: z.number(),
  gols_casa: z.number().nullable(),
  gols_visitante: z.number().nullable(),
  data: z.union([z.string(), z.date()]),
  rodada: z.number(),
  status: z.string(),
});

export const estatisticaResponseSchema = z.object({
  id: z.number(),
  jogador_id: z.number(),
  gols: z.number(),
  cartoes_amarelos: z.number(),
  cartoes_vermelhos: z.number(),
  assistencias: z.number(),
  jogador: z.object({ id: z.number(), nome: z.string() }),
});

export const partidaDetalheResponseSchema = partidaResponseSchema.extend({
  timeCasa: z.object({ id: z.number(), nome: z.string(), sigla: z.string() }),
  timeVisitante: z.object({ id: z.number(), nome: z.string(), sigla: z.string() }),
  estatisticas: z.array(estatisticaResponseSchema),
});

export const listaPartidasResponseSchema = z.array(partidaResponseSchema);

export type AgendarPartidaBody = z.infer<typeof agendarPartidaBodySchema>;
export type LancarResultadoBody = z.infer<typeof lancarResultadoBodySchema>;
export type PartidaParams = z.infer<typeof partidaParamsSchema>;
