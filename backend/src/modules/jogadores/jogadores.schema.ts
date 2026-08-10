import { z } from "zod";

export const criarJogadorBodySchema = z.object({
  nome: z.string().min(1),
  posicao: z.string().min(1),
  numero_camisa: z.coerce.number().int().positive(),
});

export const jogadorParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const jogadorResponseSchema = z.object({
  id: z.number(),
  time_id: z.number(),
  nome: z.string(),
  posicao: z.string(),
  numero_camisa: z.number(),
});

export const jogadorComTimeResponseSchema = jogadorResponseSchema.extend({
  time: z.object({
    id: z.number(),
    nome: z.string(),
    sigla: z.string(),
  }),
});

export type CriarJogadorBody = z.infer<typeof criarJogadorBodySchema>;
export type JogadorParams = z.infer<typeof jogadorParamsSchema>;
