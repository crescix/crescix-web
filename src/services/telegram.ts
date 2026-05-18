import { api } from "./api/axios-config";

export interface StartPairingResponse {
  code: string;
  expiresAt: string;
  botUsername: string | null;
}

export interface TelegramStatus {
  telegramId: string | null;
  paired: boolean;
}

/**
 * Gera um código de 6 dígitos pra vincular o Telegram à conta logada.
 * Código expira em 5 minutos.
 */
export async function startTelegramPairing(): Promise<StartPairingResponse> {
  const { data } = await api.post<StartPairingResponse>(
    "/telegram/start-pairing"
  );
  return data;
}

/**
 * Verifica se a conta logada já está vinculada a um Telegram.
 */
export async function getTelegramStatus(): Promise<TelegramStatus> {
  const { data } = await api.get<TelegramStatus>("/telegram/me");
  return data;
}

/**
 * Desfaz o vínculo da conta atual com qualquer Telegram.
 */
export async function unpairTelegram(): Promise<void> {
  await api.post("/telegram/unpair");
}
