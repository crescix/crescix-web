import { api } from "./api/axios-config";
import type { AuthResponse } from "@/types/auth";

export interface ForgotPasswordResponse {
  message: string;
}

/**
 * Dispara o envio (ou geração) do link de reset.
 * Sempre responde 200 mesmo se o e-mail não existir — não tente
 * usar isso pra descobrir se uma conta existe.
 */
export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  const { data } = await api.post<ForgotPasswordResponse>(
    "/auth/forgot-password",
    { email }
  );
  return data;
}

/**
 * Troca a senha usando o token recebido por e-mail.
 * Em sucesso, retorna { token, user } — o caller pode usar pra auto-login.
 */
export async function resetPassword(
  token: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/reset-password", {
    token,
    password,
  });
  return data;
}
