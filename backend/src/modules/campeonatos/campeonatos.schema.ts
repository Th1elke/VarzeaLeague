import { z } from "zod";

export const criarCampeonatoBodySchema = z.object({
  nome: z.string().min(1),
  temporada: z.string().min(1),
  formato: z.literal("PONTOS_CORRIDOS").default("PONTOS_CORRIDOS"),
});

export const campeonatoParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const campeonatoResponseSchema = z.object({
  id: z.number(),
  nome: z.string(),
  temporada: z.string(),
  formato: z.string(),
  status: z.string(),
});

export const timeParticipanteSchema = z.object({
  id: z.number(),
  nome: z.string(),
  sigla: z.string(),
});

export const campeonatoDetalheResponseSchema = campeonatoResponseSchema.extend({
  times: z.array(timeParticipanteSchema),
});

export const listaCampeonatosResponseSchema = z.array(campeonatoResponseSchema);

export type CriarCampeonatoBody = z.infer<typeof criarCampeonatoBodySchema>;
export type CampeonatoParams = z.infer<typeof campeonatoParamsSchema>;
