"use client";

import { useEffect, useState } from "react";
import { CardPayment, initMercadoPago } from "@mercadopago/sdk-react";
import { CreditCard, AlertCircle, Loader2 } from "lucide-react";
import {
  CriarCartaoResponse,
  SubscriptionPlan,
  criarPagamentoCartao,
  formatBRL,
  getMercadoPagoPublicKey,
} from "@/services/assinatura";
import { extractApiError } from "@/lib/utils/api-errors";

/**
 * Checkout de cartão de crédito usando o brick `<CardPayment>` do
 * Mercado Pago. O brick cuida da tokenização do cartão no browser —
 * número/CVV/validade NÃO trafegam pelo nosso backend.
 *
 * Quando o brick chama `onSubmit(cardFormData)`, a gente:
 *   1. Pega `cardFormData.token` (token opaco do cartão)
 *   2. Manda pro nosso endpoint /assinatura/cartao/criar
 *   3. Backend cria a Preapproval no MP
 *   4. Resolução da Promise sinaliza sucesso pro brick
 *
 * Customização visual: cores ajustadas pro tema dark+verde do CrescIX,
 * mas o look-and-feel do brick é do MP — não é 100% indistinguível dos
 * outros forms do app. Vale evoluir pra Secure Fields manuais no futuro
 * se quisermos um form full-CrescIX.
 *
 * Sem parcelamento: a Preapproval API do MP só suporta cobrança à vista
 * por período. `maxInstallments: 1` força isso no brick.
 */

interface CartaoCheckoutCardProps {
  plan: SubscriptionPlan;
  valor: number;
  userEmail: string;
  onSuccess: (result: CriarCartaoResponse) => void;
  onCancel: () => void;
}

// SDK do MP só pode ser inicializado uma vez por sessão (window-level).
let sdkInitialized = false;

function ensureSdkInit(): boolean {
  if (sdkInitialized) return true;
  const publicKey = getMercadoPagoPublicKey();
  if (!publicKey) {
    console.error(
      "[CartaoCheckoutCard] NEXT_PUBLIC_MP_PUBLIC_KEY não está configurada. " +
        "Defina no Vercel pra o checkout de cartão funcionar."
    );
    return false;
  }
  initMercadoPago(publicKey, { locale: "pt-BR" });
  sdkInitialized = true;
  return true;
}

export function CartaoCheckoutCard({
  plan,
  valor,
  userEmail,
  onSuccess,
  onCancel,
}: CartaoCheckoutCardProps) {
  const [sdkReady, setSdkReady] = useState(false);
  const [brickReady, setBrickReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSdkReady(ensureSdkInit());
  }, []);

  // CardPayment.onSubmit DEVE retornar uma Promise. Resolvê-la pinta o
  // brick de sucesso; rejeitá-la mostra erro inline (sem desmontar).
  async function handleSubmit(cardFormData: {
    token?: string;
    payer?: {
      email?: string;
      identification?: { type?: string; number?: string };
    };
  }): Promise<void> {
    if (!cardFormData.token) {
      setError("Não consegui gerar o token do cartão. Tente de novo.");
      throw new Error("missing-token");
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await criarPagamentoCartao({
        plan,
        cardToken: cardFormData.token,
        payerEmail: cardFormData.payer?.email ?? userEmail,
        identification: cardFormData.payer?.identification?.number
          ? {
              type:
                cardFormData.payer.identification.type === "CNPJ"
                  ? "CNPJ"
                  : "CPF",
              number: cardFormData.payer.identification.number,
            }
          : undefined,
      });

      // Sucesso (ou pending — webhook vai confirmar em segundos).
      // Deixa o componente pai decidir o que fazer (toast + redirect).
      onSuccess(result);
    } catch (err) {
      const msg = extractApiError(
        err,
        "Não consegui processar o cartão. Confira os dados ou tente outro."
      );
      setError(msg);
      setSubmitting(false);
      // Re-throw pra o brick voltar ao estado editável.
      throw err;
    }
  }

  if (!sdkReady) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
          <div className="flex-1">
            <h2 className="font-semibold text-white">
              Pagamento por cartão indisponível
            </h2>
            <p className="mt-1 text-sm text-white/70">
              Estamos configurando o pagamento por cartão. Use o PIX por
              enquanto — funciona perfeitamente.
            </p>
            <button
              onClick={onCancel}
              className="mt-4 text-sm text-brand hover:text-brand-strong"
            >
              ← Voltar e usar PIX
            </button>
          </div>
        </div>
      </div>
    );
  }

  const planLabel = plan === "MENSAL" ? "Plano Mensal" : "Plano Anual";
  const periodLabel = plan === "MENSAL" ? "por mês" : "por ano";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand/15 border border-brand/25 flex items-center justify-center shrink-0">
            <CreditCard className="h-5 w-5 text-brand" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-white">{planLabel}</h2>
            <p className="text-sm text-white/60">
              {formatBRL(valor)}{" "}
              <span className="text-white/45">{periodLabel}</span>{" "}
              · cobrança automática
            </p>
            <p className="mt-2 text-xs text-white/45 leading-relaxed">
              Sua assinatura renova automaticamente até você cancelar. Você
              pode cancelar a qualquer momento na tela de Assinatura —
              o tempo já pago segue valendo.
            </p>
          </div>
        </div>
      </div>

      {/* Brick do Mercado Pago */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
        <CardPayment
          initialization={{
            amount: valor,
            payer: { email: userEmail },
          }}
          customization={{
            paymentMethods: {
              // Sem parcelamento: a Preapproval só cobra à vista por período.
              maxInstallments: 1,
              minInstallments: 1,
              types: {
                // Só crédito. Débito e pré-pago não suportam Preapproval
                // (cobrança recorrente) — fazem cobrança única.
                included: ["credit_card"],
              },
            },
            visual: {
              style: {
                theme: "dark",
                customVariables: {
                  baseColor: "#22C55E",
                  baseColorFirstVariant: "#16A34A",
                  baseColorSecondVariant: "#166534",
                  formBackgroundColor: "transparent",
                  buttonTextColor: "#FFFFFF",
                  inputBackgroundColor: "rgba(255,255,255,0.05)",
                  inputBorderColor: "rgba(255,255,255,0.1)",
                  inputFocusedBorderColor: "#22C55E",
                  errorColor: "#EF4444",
                  successColor: "#22C55E",
                  textPrimaryColor: "#FFFFFF",
                  textSecondaryColor: "rgba(255,255,255,0.6)",
                  borderRadiusLarge: "12px",
                  borderRadiusMedium: "8px",
                  borderRadiusSmall: "6px",
                },
              },
            },
          }}
          onSubmit={handleSubmit}
          onReady={() => setBrickReady(true)}
          onError={(err) => {
            // Erros do próprio brick (campo inválido, etc.) — exibe inline.
            setError(err.message ?? "Erro no formulário do cartão.");
          }}
          locale="pt-BR"
        />

        {!brickReady && (
          <div className="flex items-center justify-center py-10 text-white/50 gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando formulário...
          </div>
        )}
      </div>

      {/* Erro inline */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Submetendo */}
      {submitting && (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processando seu cartão...
        </div>
      )}

      {/* Voltar */}
      <button
        onClick={onCancel}
        className="text-sm text-white/55 hover:text-white"
      >
        ← Voltar pros métodos de pagamento
      </button>
    </div>
  );
}
