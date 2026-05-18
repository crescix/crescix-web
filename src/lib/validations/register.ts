import * as z from "zod";

export const registerSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string().min(1, "Confirme sua senha"),
  // LGPD: consentimento explícito é obrigatório. Sem essa marca, o
  // form não submete. Em /privacidade explicamos exatamente o que isso
  // significa.
  aceitouTermos: z.literal(true, {
    message: "Você precisa aceitar os termos e a política de privacidade",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export type RegisterData = z.infer<typeof registerSchema>;