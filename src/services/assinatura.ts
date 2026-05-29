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

/**
 * Info da assinatura recorrente quando o usuário tem cartão ativo.
 * Null quando não tem (só PIX ou nada).
 */
export interface RecurringSubscriptionInfo {
  method: "credit_card";
  cardBrand: string | null;
  cardLastFour: string | null;
  preapprovalStatus: string | null;
}

export interface SubscriptionStatusResponse {
  status: SubscriptionStatus;
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
  daysRemaining: number;
  trialDurationDays: number;
  recurring: RecurringSubscriptionInfo | null;
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

export interface CriarCartaoResponse {
  paymentId: string;
  preapprovalId: string;
  status: "PAID" | "PENDING";
  plan: SubscriptionPlan;
  valor: number;
  frequencyMonths: number;
}

export interface CancelarAssinaturaResponse {
  status: "cancelled" | "no_active_subscription";
  subscriptionEndsAt: string | null;
}

export interface PaymentStatusResponse {
  id: string;
  status: PaymentStatus;
  plan: SubscriptionPlan;
  valor: number;
  metodo: string | null;
  installments?: number | null;
  cardBrand?: string | null;
  cardLastFour?: string | null;
  paidAt: string | null;
  createdAt: string;
}

// ─── Endpoints ───────────────────────────────────────────────────────────────

/**
 * Status atual da assinatura do usuário autenticado. Inclui status
 * calculado dinamicamente (não confia no cache), dias restantes, info
 * de assinatura recorrente (cartão) se houver, e a lista de planos.
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
 * Cria uma assinatura recorrente via cartão de crédito.
 *
 * IMPORTANTE: o `cardToken` deve ter sido gerado no browser pelo SDK
 * do Mercado Pago (`@mercadopago/sdk-react`). Nunca enviar dados do
 * cartão (número, CVV, validade) direto — eles **não passam por aqui**.
 *
 * Quando bem-sucedido:
 *   - Status PAID: primeira cobrança aprovada na hora; o user já tem
 *     subscriptionEndsAt estendido e mpPreapprovalId salvo.
 *   - Status PENDING: MP aceitou a preapproval mas ainda não confirmou
 *     a primeira cobrança. Webhook vai chegar em alguns segundos.
 *
 * Erros comuns (status 402 do backend):
 *   - Cartão recusado pelo emissor
 *   - Saldo insuficiente
 *   - Dados de cartão inválidos
 *   - Preapproval API não habilitada na conta MP (em produção)
 */
export async function criarPagamentoCartao(opts: {
  plan: SubscriptionPlan;
  cardToken: string;
  payerEmail: string;
  identification?: { type: "CPF" | "CNPJ"; number: string };
}): Promise<CriarCartaoResponse> {
  const { data } = await api.post<CriarCartaoResponse>(
    "/assinatura/cartao/criar",
    opts
  );
  return data;
}

/**
 * Cancela a assinatura recorrente de cartão. O tempo já pago continua
 * valendo até `subscriptionEndsAt` — não há reembolso.
 *
 * Idempotente: se não tem nada pra cancelar, retorna status
 * `"no_active_subscription"` sem erro.
 */
export async function cancelarAssinatura(): Promise<CancelarAssinaturaResponse> {
  const { data } = await api.post<CancelarAssinaturaResponse>(
    "/assinatura/cancelar"
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
  const { data } = await api.get<PaymentStatusResponse[]>(
    "/assinatura/payments"
  );
  return data;
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

// ─── Feature flag ────────────────────────────────────────────────────────────

/**
 * Cartão de crédito é uma feature flag controlada por env. Vale `true`
 * por padrão. Setar `NEXT_PUBLIC_CREDIT_CARD_ENABLED=false` no Vercel
 * pra esconder a aba "Cartão" sem precisar de deploy de código (útil
 * enquanto a Preapproval API não está habilitada na conta do MP).
 */
export function isCreditCardEnabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_CREDIT_CARD_ENABLED;
  // Default ON — só desliga se explicitamente "false".
  return flag !== "false";
}

/**
 * Public key do Mercado Pago — usada pelo SDK no browser pra tokenizar
 * cartões. NÃO É segredo (sai no bundle do front, está no painel
 * publicamente da conta MP). Sem ela, a aba cartão não funciona.
 */
export function getMercadoPagoPublicKey(): string | undefined {
  return process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
}
