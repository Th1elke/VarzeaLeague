import { z } from "zod";

export const inscreverTimeBodySchema = z.object({
  time_id: z.coerce.number().int().positive(),
});

export const participacaoResponseSchema = z.object({
  id: z.number(),
  campeonato_id: z.number(),
  time_id: z.number(),
});

export type InscreverTimeBody = z.infer<typeof inscreverTimeBodySchema>;
