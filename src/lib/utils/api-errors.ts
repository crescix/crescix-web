/**
 * Helpers de extração de mensagens de erro vindas da API ou da rede.
 *
 * O backend devolve { error, message, statusCode } padronizado, mas
 * em alguns casos a request nem chega: timeout, ECONNREFUSED (API
 * fora do ar), DNS falhando, etc. Esse helper centraliza a tradução
 * para mensagens amigáveis em português.
 *
 * Filosofia: mensagens curtas, em português comum (sem "registro",
 * "instância", "validação", "servidor"), na 1ª pessoa quando faz
 * sentido ("Não consegui..."). Evitar reclamação genérica — sempre
 * sugerir o próximo passo do usuário.
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
    // 1. Mensagem explícita do backend tem prioridade.
    //    Mesmo que pareça técnica, o backend conhece o contexto melhor —
    //    a humanização lá em si fica em crescix-api.
    const data = err.response?.data as
      | { message?: string; error?: string }
      | undefined;
    if (data?.message) return data.message;

    // 2. Erros de rede (sem resposta do servidor)
    if (!err.response) {
      if (err.code === "ECONNABORTED" || err.message.includes("timeout")) {
        return "Demorou demais pra responder. Confere sua internet e tenta de novo.";
      }
      if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
        return "Não consegui falar com o servidor. Confere sua internet?";
      }
      return "Algo travou na conexão. Tenta de novo em alguns instantes.";
    }

    // 3. Códigos HTTP comuns. Pra um dono de pequeno negócio, "registro
    //    não encontrado" e "401" são igualmente abstratos — as mensagens
    //    abaixo evitam jargão e tentam orientar o próximo passo.
    const status = err.response.status;
    if (status === 401) return "Sua sessão expirou. Faz login de novo, por favor.";
    if (status === 403) return "Você não tem permissão pra fazer isso.";
    if (status === 404) return "Não encontrei o que você procura.";
    if (status === 409) return "Já existe algo com esses dados.";
    if (status === 422) return "Algum campo precisa de ajuste. Confere os dados?";
    if (status === 429) return "Muitas tentativas seguidas. Espera uns segundos.";
    if (status === 503) {
      return "O serviço tá fora do ar agora. Tenta de novo em alguns minutos.";
    }
    if (status >= 500) {
      return "Algo deu errado do nosso lado. Tenta de novo em alguns instantes.";
    }
  }

  // 4. Erro nativo do JS
  if (err instanceof Error && err.message) return err.message;

  return fallback;
}
