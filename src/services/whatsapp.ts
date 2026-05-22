import { api } from "./api/axios-config";

export interface StartWhatsappPairingResponse {
  code: string;
  expiresAt: string;
}

export interface WhatsappStatus {
  whatsappPhone: string | null;
  paired: boolean;
}

/**
 * Gera um código de 6 dígitos pra vincular o WhatsApp à conta logada.
 * Código expira em 5 minutos. Diferente do Telegram, NÃO retorna
 * `botUsername` — o usuário precisa mandar mensagem pro número do
 * bot WhatsApp que o admin do CrescIX divulga (geralmente um chip
 * dedicado, ex.: +55 35 99999-9999).
 */
export async function startWhatsappPairing(): Promise<StartWhatsappPairingResponse> {
  const { data } = await api.post<StartWhatsappPairingResponse>(
    "/whatsapp/start-pairing"
  );
  return data;
}

/**
 * Verifica se a conta logada já está vinculada a um WhatsApp.
 */
export async function getWhatsappStatus(): Promise<WhatsappStatus> {
  const { data } = await api.get<WhatsappStatus>("/whatsapp/me");
  return data;
}

/**
 * Desfaz o vínculo da conta atual com qualquer WhatsApp.
 */
export async function unpairWhatsapp(): Promise<void> {
  await api.post("/whatsapp/unpair");
}
