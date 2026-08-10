import { z } from "zod";

export const registroBodySchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const loginBodySchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

export const authResponseSchema = z.object({
  token: z.string(),
  usuario: z.object({
    id: z.number(),
    email: z.string(),
  }),
});

export type RegistroBody = z.infer<typeof registroBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
