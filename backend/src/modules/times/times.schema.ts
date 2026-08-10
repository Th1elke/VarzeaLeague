import { z } from "zod";

export const criarTimeBodySchema = z.object({
  nome: z.string().min(1),
  sigla: z.string().min(1).max(10),
  cidade: z.string().min(1),
  escudo_url: z.string().url().optional(),
});

export const timeParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const jogadorResumoSchema = z.object({
  id: z.number(),
  nome: z.string(),
  posicao: z.string(),
  numero_camisa: z.number(),
});

export const timeResponseSchema = z.object({
  id: z.number(),
  nome: z.string(),
  sigla: z.string(),
  cidade: z.string(),
  escudo_url: z.string().nullable(),
});

export const timeComElencoResponseSchema = timeResponseSchema.extend({
  jogadores: z.array(jogadorResumoSchema),
});

export const listaTimesResponseSchema = z.array(timeResponseSchema);

export type CriarTimeBody = z.infer<typeof criarTimeBodySchema>;
export type TimeParams = z.infer<typeof timeParamsSchema>;
