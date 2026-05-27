"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { extractApiError } from "@/lib/utils/api-errors";
import {
  CriarPixResponse,
  SubscriptionPlan,
  SubscriptionStatusResponse,
  criarPixAssinatura,
  getAssinaturaStatus,
} from "@/services/assinatura";
import { PlanPicker } from "./_components/plan-picker";
import { PixCheckoutCard } from "./_components/pix-checkout-card";
import { PaymentHistory } from "./_components/payment-history";

/**
 * Tela /assinatura — central de pagamentos da CrescIX.
 *
 * Comportamento por status:
 *   - TRIAL/ACTIVE → mostra resumo + opção de assinar/renovar
 *   - EXPIRED      → mensagem de aviso + cards de plano (foco em pagar)
 *   - CANCELED     → idem EXPIRED com texto específico
 *
 * Fluxo de pagamento:
 *   1. Usuário clica "Assinar mensal/anual"
 *   2. POST /assinatura/pix/criar → recebe QR + copia-e-cola
 *   3. PixCheckoutCard faz polling em GET /assinatura/payments/:id
 *   4. Quando vira PAID → toast + redirect pra /dashboard
 */
export default function AssinaturaPage() {
  const router = useRouter();
  const toast = useToast();

  const [statusData, setStatusData] =
    useState<SubscriptionStatusResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pickingPlan, setPickingPlan] = useState<SubscriptionPlan | null>(null);
  const [pix, setPix] = useState<CriarPixResponse | null>(null);

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

  const handlePick = useCallback(
    async (plan: SubscriptionPlan) => {
      setPickingPlan(plan);
      try {
        const data = await criarPixAssinatura(plan);
        setPix(data);
      } catch (err) {
        toast.error(extractApiError(err, "Não consegui criar a cobrança PIX. Tente novamente."));
      } finally {
        setPickingPlan(null);
      }
    },
    [toast]
  );

  function handleRegenerate() {
    if (pix) {
      const plan = pix.plan;
      setPix(null);
      handlePick(plan);
    }
  }

  function handlePaid() {
    toast.success("Pagamento confirmado! Sua assinatura foi ativada.");
    loadStatus().then(() => {
      router.push("/dashboard");
    });
  }

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

  if (pix) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Assinatura CrescIX</h1>
          <button
            onClick={() => setPix(null)}
            className="text-sm text-white/60 hover:text-white"
          >
            ← Voltar pros planos
          </button>
        </div>
        <PixCheckoutCard
          pix={pix}
          onPaid={handlePaid}
          onRegenerate={handleRegenerate}
        />
      </div>
    );
  }

  const { status, daysRemaining, plans, subscriptionEndsAt, trialEndsAt } =
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

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-white">
          {status === "ACTIVE" ? "Renovar antecipado" : "Escolha seu plano"}
        </h2>
        <PlanPicker
          plans={plans}
          onPick={handlePick}
          pickingPlan={pickingPlan}
        />
      </div>

      <div className="mt-8">
        <PaymentHistory />
      </div>

      <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <ShieldCheck className="h-4 w-4 text-brand-green" />
          Pagamento 100% seguro via Mercado Pago
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-white/70">
          <li>
            <strong className="text-white">Sem auto-renovação:</strong> você
            paga 1× e a assinatura vale pelo período contratado. Quando faltar
            pouco pra vencer, a gente te avisa.
          </li>
          <li>
            <strong className="text-white">Cancele a qualquer momento:</strong>{" "}
            o tempo já pago segue valendo até o fim. Sem multa.
          </li>
          <li>
            <strong className="text-white">Dúvidas?</strong> Manda um e-mail pra{" "}
            <span className="text-brand-green">suporte@crescix.com.br</span> ou
            pelo bot do Telegram/WhatsApp.
          </li>
        </ul>
      </div>
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
