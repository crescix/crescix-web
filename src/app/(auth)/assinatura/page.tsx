"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Loader2,
  ShieldCheck,
  CreditCard,
  Repeat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { extractApiError } from "@/lib/utils/api-errors";
import { useAuth } from "@/context/auth-context";
import {
  CriarPixResponse,
  CriarCartaoResponse,
  SubscriptionPlan,
  SubscriptionStatusResponse,
  cancelarAssinatura,
  criarPixAssinatura,
  getAssinaturaStatus,
  isCreditCardEnabled,
} from "@/services/assinatura";
import { PlanPicker } from "./_components/plan-picker";
import { PixCheckoutCard } from "./_components/pix-checkout-card";
import { PaymentHistory } from "./_components/payment-history";
import { MethodPicker, type PaymentMethod } from "./_components/method-picker";
import { CartaoCheckoutCard } from "./_components/cartao-checkout-card";

/**
 * Tela /assinatura — central de pagamentos da CrescIX.
 *
 * State machine:
 *   1. (default) → PlanPicker (escolher plano mensal/anual)
 *   2. plano escolhido → MethodPicker (PIX ou Cartão)
 *   3a. PIX     → PixCheckoutCard (QR + polling)
 *   3b. Cartão  → CartaoCheckoutCard (form do MP)
 *
 * Quando o user já tem assinatura recorrente ativa (cartão), em vez do
 * PlanPicker ele vê um card "Cartão Visa final 1234 — próx. cobrança
 * em DD/MM" + botão "Cancelar assinatura".
 *
 * Fluxo de cancelamento:
 *   - POST /assinatura/cancelar (idempotente)
 *   - subscriptionEndsAt mantém — tempo já pago vale até a data
 *   - Status muda pra CANCELED no banco
 */
export default function AssinaturaPage() {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();

  const [statusData, setStatusData] =
    useState<SubscriptionStatusResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // State machine
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null
  );
  const [pix, setPix] = useState<CriarPixResponse | null>(null);
  const [pickingPlan, setPickingPlan] = useState<SubscriptionPlan | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const data = await getAssinaturaStatus();
      setStatusData(data);
      setLoadError(null);
    } catch (err) {
      setLoadError(
        extractApiError(err, "Não consegui carregar sua assinatura agora.")
      );
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // ── Handlers do fluxo de compra ────────────────────────────────────────
  function handlePickPlan(plan: SubscriptionPlan) {
    setSelectedPlan(plan);
    setSelectedMethod(null); // garante que vai pro MethodPicker
  }

  const handlePickMethod = useCallback(
    async (method: PaymentMethod) => {
      if (!selectedPlan) return;

      if (method === "pix") {
        // Gera o PIX e vai pra tela do QR.
        setPickingPlan(selectedPlan);
        try {
          const data = await criarPixAssinatura(selectedPlan);
          setPix(data);
          setSelectedMethod("pix");
        } catch (err) {
          toast.error(
            extractApiError(
              err,
              "Não consegui criar a cobrança PIX. Tente novamente."
            )
          );
        } finally {
          setPickingPlan(null);
        }
        return;
      }

      // Cartão: só seta o método; o componente do brick é renderizado.
      setSelectedMethod("credit_card");
    },
    [selectedPlan, toast]
  );

  function handleRegeneratePix() {
    if (pix) {
      const plan = pix.plan;
      setPix(null);
      setSelectedMethod(null);
      handlePickMethod("pix");
      setSelectedPlan(plan); // garante que o plano segue
    }
  }

  function handlePaid() {
    toast.success("Pagamento confirmado! Sua assinatura foi ativada.");
    setPix(null);
    setSelectedPlan(null);
    setSelectedMethod(null);
    loadStatus().then(() => {
      router.push("/dashboard");
    });
  }

  function handleCardSuccess(result: CriarCartaoResponse) {
    if (result.status === "PAID") {
      toast.success("Pagamento confirmado! Sua assinatura foi ativada.");
    } else {
      toast.success(
        "Cartão registrado! Estamos confirmando o pagamento — em alguns segundos a assinatura é ativada."
      );
    }
    setSelectedPlan(null);
    setSelectedMethod(null);
    loadStatus().then(() => {
      router.push("/dashboard");
    });
  }

  function handleResetCheckout() {
    setPix(null);
    setSelectedMethod(null);
  }

  function handleResetPlan() {
    setSelectedPlan(null);
    setSelectedMethod(null);
    setPix(null);
  }

  // ── Cancelar assinatura recorrente ─────────────────────────────────────
  async function handleConfirmCancel() {
    setCanceling(true);
    try {
      const result = await cancelarAssinatura();
      if (result.status === "cancelled") {
        toast.success(
          "Assinatura cancelada. Seu acesso segue até a data já paga."
        );
      } else {
        toast.success("Você já não tem assinatura ativa.");
      }
      await loadStatus();
    } catch (err) {
      toast.error(
        extractApiError(err, "Não consegui cancelar agora. Tente daqui a pouco.")
      );
    } finally {
      setCanceling(false);
      setCancelOpen(false);
    }
  }

  // ── Renders ────────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h1 className="mt-3 text-lg font-semibold text-white">
            Erro ao carregar assinatura
          </h1>
          <p className="mt-2 text-sm text-white/70">{loadError}</p>
          <Button onClick={loadStatus} className="mt-4" variant="outline">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!statusData) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-white/40" />
        </div>
      </div>
    );
  }

  // ── Checkout PIX ativo ──
  if (pix) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Assinatura CrescIX</h1>
          <button
            onClick={handleResetCheckout}
            className="text-sm text-white/60 hover:text-white"
          >
            ← Voltar
          </button>
        </div>
        <PixCheckoutCard
          pix={pix}
          onPaid={handlePaid}
          onRegenerate={handleRegeneratePix}
        />
      </div>
    );
  }

  // ── Checkout Cartão ativo ──
  if (selectedPlan && selectedMethod === "credit_card") {
    const planConfig = statusData.plans[selectedPlan];
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Assinatura CrescIX</h1>
          <button
            onClick={handleResetCheckout}
            className="text-sm text-white/60 hover:text-white"
          >
            ← Voltar
          </button>
        </div>
        <CartaoCheckoutCard
          plan={selectedPlan}
          valor={planConfig.valor}
          userEmail={user?.email ?? ""}
          onSuccess={handleCardSuccess}
          onCancel={handleResetCheckout}
        />
      </div>
    );
  }

  // ── Method picker (plano escolhido, falta escolher método) ──
  if (selectedPlan && !selectedMethod) {
    const planConfig = statusData.plans[selectedPlan];
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white md:text-3xl">
            Assinatura CrescIX
          </h1>
        </div>
        <MethodPicker
          plan={selectedPlan}
          valor={planConfig.valor}
          onPick={handlePickMethod}
          onBack={handleResetPlan}
        />
        {pickingPlan && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-white/55">
            <Loader2 className="h-4 w-4 animate-spin" />
            Gerando cobrança...
          </div>
        )}
      </div>
    );
  }

  // ── Tela principal ──
  const { status, daysRemaining, plans, subscriptionEndsAt, trialEndsAt, recurring } =
    statusData;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white md:text-3xl">
          Assinatura CrescIX
        </h1>
        <p className="mt-1 text-sm text-white/60">
          Mantenha seu negócio organizado com a gente.
        </p>
      </div>

      <StatusBanner
        status={status}
        daysRemaining={daysRemaining}
        trialEndsAt={trialEndsAt}
        subscriptionEndsAt={subscriptionEndsAt}
      />

      {/* Card de assinatura recorrente ativa (cartão) */}
      {recurring && status === "ACTIVE" && (
        <div className="mt-6 rounded-2xl border border-brand/30 bg-brand/5 p-5">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand/15 border border-brand/25 flex items-center justify-center shrink-0">
              <CreditCard className="h-5 w-5 text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white">
                Cartão recorrente ativo
              </h3>
              <p className="mt-1 text-sm text-white/70">
                {recurring.cardBrand && recurring.cardLastFour
                  ? `${recurring.cardBrand} final ${recurring.cardLastFour}`
                  : "Cartão de crédito"}{" "}
                · renovação automática
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-white/55">
                <Repeat className="h-3 w-3" />
                Próxima cobrança quando o período atual vencer
              </p>
              <button
                onClick={() => setCancelOpen(true)}
                className="mt-4 text-sm font-medium text-red-400 hover:text-red-300"
              >
                Cancelar assinatura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Picker de plano — só se não tem recurring ativo */}
      {!recurring && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-white">
            {status === "ACTIVE" ? "Renovar antecipado" : "Escolha seu plano"}
          </h2>
          <PlanPicker
            plans={plans}
            onPick={handlePickPlan}
            pickingPlan={pickingPlan}
          />
        </div>
      )}

      <div className="mt-8">
        <PaymentHistory />
      </div>

      <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <ShieldCheck className="h-4 w-4 text-brand" />
          Pagamento 100% seguro via Mercado Pago
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-white/70">
          <li>
            <strong className="text-white">PIX único:</strong> você paga 1× e a
            assinatura vale pelo período contratado. Sem auto-renovação — quando
            faltar pouco pra vencer, a gente avisa.
          </li>
          {isCreditCardEnabled() && (
            <li>
              <strong className="text-white">Cartão recorrente:</strong> a
              primeira cobrança é feita agora; depois o Mercado Pago renova
              automaticamente até você cancelar.
            </li>
          )}
          <li>
            <strong className="text-white">Cancele a qualquer momento:</strong>{" "}
            o tempo já pago segue valendo até o fim. Sem multa.
          </li>
          <li>
            <strong className="text-white">Dúvidas?</strong> Manda um e-mail pra{" "}
            <a
              href="mailto:suporte@crescix.com.br"
              className="text-brand hover:text-brand-strong"
            >
              suporte@crescix.com.br
            </a>{" "}
            ou pelo bot do Telegram/WhatsApp.
          </li>
        </ul>
      </div>

      {/* Confirmação de cancelamento */}
      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancelar assinatura?"
        description={
          subscriptionEndsAt
            ? `Sua assinatura ficará ativa até ${new Date(
                subscriptionEndsAt
              ).toLocaleDateString("pt-BR")}. Depois disso, você precisará assinar novamente pra criar registros. Sem multa, sem reembolso proporcional.`
            : "Cancelar agora interromperá a renovação automática. Você poderá voltar a assinar quando quiser."
        }
        confirmLabel="Sim, cancelar"
        confirmingLabel="Cancelando..."
        cancelLabel="Manter assinatura"
        variant="destructive"
        onConfirm={handleConfirmCancel}
        isConfirming={canceling}
      />
    </div>
  );
}

// ─── Banner de status ────────────────────────────────────────────────────────

interface StatusBannerProps {
  status: SubscriptionStatusResponse["status"];
  daysRemaining: number;
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
}

function StatusBanner({
  status,
  daysRemaining,
  trialEndsAt,
  subscriptionEndsAt,
}: StatusBannerProps) {
  const dataAlvo = subscriptionEndsAt || trialEndsAt;
  const dataFmt = dataAlvo
    ? new Date(dataAlvo).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  if (status === "ACTIVE") {
    return (
      <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 shrink-0 text-green-400" />
          <div>
            <h2 className="font-semibold text-white">Assinatura ativa</h2>
            <p className="mt-1 text-sm text-white/70">
              Válida até <strong className="text-white">{dataFmt}</strong> (
              {daysRemaining} {daysRemaining === 1 ? "dia" : "dias"} restantes).
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "TRIAL") {
    const aviso = daysRemaining <= 3;
    const dias = daysRemaining + " " + (daysRemaining === 1 ? "dia" : "dias");
    return (
      <div
        className={
          "rounded-2xl border p-5 " +
          (aviso
            ? "border-amber-500/40 bg-amber-500/10"
            : "border-white/10 bg-white/5")
        }
      >
        <div className="flex items-start gap-3">
          <AlertCircle
            className={
              "h-5 w-5 shrink-0 " +
              (aviso ? "text-amber-400" : "text-white/50")
            }
          />
          <div>
            <h2 className="font-semibold text-white">
              {aviso
                ? "Seu teste acaba em " + dias
                : "Você ainda tem " + dias + " de teste"}
            </h2>
            <p className="mt-1 text-sm text-white/70">
              {aviso
                ? "Assine agora pra não perder acesso a criar registros depois de " +
                  dataFmt +
                  "."
                : "Aproveite até " +
                  dataFmt +
                  " pra explorar. Quando o teste acabar, você precisará assinar pra criar novos registros (consultas continuam liberadas)."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
        <div>
          <h2 className="font-semibold text-white">
            {status === "CANCELED"
              ? "Sua assinatura foi cancelada"
              : "Sua assinatura venceu"}
          </h2>
          <p className="mt-1 text-sm text-white/70">
            Você ainda consegue consultar todos os seus dados, mas pra criar
            novos registros (vendas, compras, contas, etc.) precisa assinar um
            plano abaixo.
          </p>
        </div>
      </div>
    </div>
  );
}
