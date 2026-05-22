import { api } from "@/services/api/axios-config";
import type { SubscriptionStatus } from "@/types/auth";

/**
 * Detalhes de um plano disponível pra compra. Espelha o que o
 * crescix-api expõe em `GET /assinatura/status` (constante PLANS).
 */
export interface PlanoAssinatura {
  code: "MENSAL" | "ANUAL";
  label: string;
  days: number;
  valor: number;
}

export interface AssinaturaStatus {
  status: SubscriptionStatus;
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
  daysRemaining: number;
  trialDurationDays: number;
  plans: {
    MENSAL: PlanoAssinatura;
    ANUAL: PlanoAssinatura;
  };
}

/**
 * Busca o status da assinatura do usuário autenticado.
 * O status é calculado dinamicamente no backend — não precisa recalcular
 * comparando datas no cliente.
 */
export async function getAssinaturaStatus(): Promise<AssinaturaStatus> {
  const response = await api.get<AssinaturaStatus>("/assinatura/status");
  return response.data;
}
