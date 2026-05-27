import { api } from "./api/axios-config";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "EXPIRED" | "CANCELED";
export type SubscriptionPlan = "MENSAL" | "ANUAL";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface PlanInfo {
  code: SubscriptionPlan;
  label: string;
  days: number;
  valor: number;
}

export interface SubscriptionStatusResponse {
  status: SubscriptionStatus;
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
  daysRemaining: number;
  trialDurationDays: number;
  plans: {
    MENSAL: PlanInfo;
    ANUAL: PlanInfo;
  };
}

export interface CriarPixResponse {
  paymentId: string;
  mpPaymentId: string;
  qrCode: string;        // copia-e-cola PIX
  qrCodeBase64: string;  // imagem base64 (sem o prefixo data:)
  valor: number;
  plan: SubscriptionPlan;
  expiresAt: string;     // ISO
}

export interface PaymentStatusResponse {
  id: string;
  status: PaymentStatus;
  plan: SubscriptionPlan;
  valor: number;
  metodo: string | null;
  paidAt: string | null;
  createdAt: string;
}

// ─── Endpoints ───────────────────────────────────────────────────────────────

/**
 * Status atual da assinatura do usuário autenticado. Inclui status
 * calculado dinamicamente (não confia no cache), dias restantes e a
 * lista de planos disponíveis.
 */
export async function getAssinaturaStatus(): Promise<SubscriptionStatusResponse> {
  const { data } = await api.get<SubscriptionStatusResponse>(
    "/assinatura/status"
  );
  return data;
}

/**
 * Cria uma cobrança PIX no Mercado Pago. Retorna o QR Code (imagem
 * base64) + o código copia-e-cola que o usuário pode usar pra pagar.
 *
 * O `paymentId` retornado é usado pra fazer polling em
 * `getPaymentStatus(id)` enquanto o usuário paga.
 */
export async function criarPixAssinatura(
  plan: SubscriptionPlan
): Promise<CriarPixResponse> {
  const { data } = await api.post<CriarPixResponse>(
    "/assinatura/pix/criar",
    { plan }
  );
  return data;
}

/**
 * Status de um pagamento específico. Usado pelo polling enquanto a tela
 * do QR Code está aberta. Quando `status === "PAID"`, a assinatura do
 * usuário já foi estendida no backend — basta fazer um refresh do auth
 * context (ou do /auth/me) e seguir pra rota protegida.
 */
export async function getPaymentStatus(
  paymentId: string
): Promise<PaymentStatusResponse> {
  const { data } = await api.get<PaymentStatusResponse>(
    `/assinatura/payments/${paymentId}`
  );
  return data;
}

/**
 * Lista o histórico de pagamentos do usuário autenticado. Backend
 * retorna os 50 mais recentes em ordem decrescente — cobre anos de
 * plano mensal sem precisar paginar.
 *
 * Tela /assinatura usa pra mostrar tudo o que o cliente já pagou +
 * status de cada cobrança (PAID confirmado, PENDING em aberto,
 * FAILED rejeitado).
 */
export async function listPayments(): Promise<PaymentStatusResponse[]> {
  const { data } = await api.get<{ data: PaymentStatusResponse[] }>(
    "/assinatura/payments"
  );
  return data.data;
}

// ─── Labels e helpers de display ─────────────────────────────────────────────

export const SUBSCRIPTION_STATUS_LABEL: Record<SubscriptionStatus, string> = {
  TRIAL: "Período de teste",
  ACTIVE: "Assinatura ativa",
  EXPIRED: "Assinatura vencida",
  CANCELED: "Assinatura cancelada",
};

/**
 * Cor semântica do status — usar como classe Tailwind ou referência
 * pra montar badge.
 */
export const SUBSCRIPTION_STATUS_TONE: Record<
  SubscriptionStatus,
  "neutral" | "success" | "warning" | "danger"
> = {
  TRIAL: "warning",
  ACTIVE: "success",
  EXPIRED: "danger",
  CANCELED: "danger",
};

/**
 * Formata valor BRL com vírgula: 69.9 → "R$ 69,90".
 */
export function formatBRL(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
