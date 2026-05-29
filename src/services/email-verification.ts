import { api } from "./api/axios-config";

export interface VerifyEmailResponse {
  message: string;
  email: string;
}

export interface ResendVerificationResponse {
  message: string;
}

/**
 * Confirma o e-mail do cliente usando o token que veio no link enviado
 * por e-mail (`/verificar-email?token=xxx`). Endpoint público.
 *
 * Resposta 200 → e-mail confirmado. O cliente deve ser redirecionado
 * pra /login pra fazer login normalmente.
 *
 * 4xx → token inválido/expirado. Front mostra mensagem e oferece
 * o botão "reenviar link".
 */
export async function verifyEmail(token: string): Promise<VerifyEmailResponse> {
  const { data } = await api.post<VerifyEmailResponse>("/auth/verify-email", {
    token,
  });
  return data;
}

/**
 * Pede um novo link de verificação por e-mail. Endpoint público.
 *
 * Resposta SEMPRE 200, mesmo se o e-mail não existir ou já estiver
 * verificado — proteção contra enumeração de contas. Não confie na
 * resposta pra saber se o reenvio foi efetivo, só mostre uma
 * mensagem genérica "se o e-mail existe, enviaremos um novo link".
 */
export async function resendVerification(
  email: string
): Promise<ResendVerificationResponse> {
  const { data } = await api.post<ResendVerificationResponse>(
    "/auth/resend-verification",
    { email }
  );
  return data;
}
