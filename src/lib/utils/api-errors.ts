/**
 * Helpers de extração de mensagens de erro vindas da API ou da rede.
 *
 * O backend devolve { error, message, statusCode } padronizado, mas
 * em alguns casos a request nem chega: timeout, ECONNREFUSED (API
 * fora do ar), DNS falhando, etc. Esse helper centraliza a tradução
 * para mensagens amigáveis em português.
 */

import axios from "axios";

/**
 * Extrai uma mensagem amigável de qualquer erro de request.
 *
 * Ordem de prioridade:
 * 1. `response.data.message` — mensagem explícita do backend
 * 2. Códigos HTTP comuns (401/403/404/409/422/429/500/503)
 * 3. Erros de rede (sem resposta) → mensagem genérica de conexão
 * 4. Fallback fornecido pela chamada
 */
export function extractApiError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    // 1. Mensagem explícita do backend tem prioridade
    const data = err.response?.data as
      | { message?: string; error?: string }
      | undefined;
    if (data?.message) return data.message;

    // 2. Erros de rede (sem resposta do servidor)
    if (!err.response) {
      if (err.code === "ECONNABORTED" || err.message.includes("timeout")) {
        return "Tempo de resposta esgotado. Verifique sua conexão.";
      }
      if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
        return "Não foi possível conectar ao servidor. Verifique sua conexão.";
      }
      return "Erro de conexão. Tente novamente em instantes.";
    }

    // 3. Códigos HTTP comuns
    const status = err.response.status;
    if (status === 401) return "Sessão expirada. Faça login novamente.";
    if (status === 403) return "Você não tem permissão para essa ação.";
    if (status === 404) return "Registro não encontrado.";
    if (status === 409) return "Esse registro já existe.";
    if (status === 422) return "Dados inválidos.";
    if (status === 429) return "Muitas tentativas. Aguarde alguns instantes.";
    if (status === 503)
      return "Serviço temporariamente indisponível. Tente novamente em instantes.";
    if (status >= 500) return "Erro interno do servidor. Tente novamente.";
  }

  // 4. Erro nativo do JS
  if (err instanceof Error && err.message) return err.message;

  return fallback;
}
