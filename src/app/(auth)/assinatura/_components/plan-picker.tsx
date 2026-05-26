"use client";

import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PlanInfo,
  SubscriptionPlan,
  formatBRL,
} from "@/services/assinatura";

interface PlanPickerProps {
  plans: { MENSAL: PlanInfo; ANUAL: PlanInfo };
  onPick: (plan: SubscriptionPlan) => void;
  pickingPlan: SubscriptionPlan | null;
}

/**
 * Cards lado-a-lado dos 2 planos. Anual aparece destacado como "melhor
 * valor" — diferença de preço apresentada como "economia por mês".
 */
export function PlanPicker({ plans, onPick, pickingPlan }: PlanPickerProps) {
  const mensal = plans.MENSAL;
  const anual = plans.ANUAL;
  const mensalEquivalenteDoAnual = anual.valor / 12;
  const economiaMensal = mensal.valor - mensalEquivalenteDoAnual;
  const economiaPercentual = Math.round((economiaMensal / mensal.valor) * 100);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* MENSAL */}
      <PlanCard
        title="Mensal"
        price={formatBRL(mensal.valor)}
        period="/mês"
        description="Pague mês a mês. Cancele quando quiser."
        ctaLabel={`Assinar mensal por ${formatBRL(mensal.valor)}`}
        loading={pickingPlan === "MENSAL"}
        disabled={pickingPlan !== null}
        onClick={() => onPick("MENSAL")}
        features={[
          "Acesso completo ao app",
          "Bots Telegram e WhatsApp",
          "Insights financeiros com IA",
          "Suporte por e-mail",
        ]}
      />

      {/* ANUAL — destacado */}
      <PlanCard
        title="Anual"
        price={formatBRL(mensalEquivalenteDoAnual)}
        period="/mês"
        subtext={`12× ${formatBRL(mensalEquivalenteDoAnual)} · ${formatBRL(anual.valor)} à vista`}
        description={`Economize ${economiaPercentual}% pagando o ano todo de uma vez.`}
        badge={`Economia de ${formatBRL(economiaMensal)}/mês`}
        ctaLabel={`Assinar anual por ${formatBRL(anual.valor)}`}
        highlight
        loading={pickingPlan === "ANUAL"}
        disabled={pickingPlan !== null}
        onClick={() => onPick("ANUAL")}
        features={[
          "Tudo do plano mensal",
          "30% mais barato no equivalente mensal",
          "Sem se preocupar com renovação",
          "Suporte prioritário",
        ]}
      />
    </div>
  );
}

interface PlanCardProps {
  title: string;
  price: string;
  period: string;
  subtext?: string;
  description: string;
  badge?: string;
  ctaLabel: string;
  highlight?: boolean;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
  features: string[];
}

function PlanCard({
  title,
  price,
  period,
  subtext,
  description,
  badge,
  ctaLabel,
  highlight,
  loading,
  disabled,
  onClick,
  features,
}: PlanCardProps) {
  return (
    <div
      className={
        "flex flex-col rounded-2xl border p-6 transition " +
        (highlight
          ? "border-green-500/40 bg-green-500/5 shadow-[0_0_40px_-15px_rgba(34,197,94,0.4)]"
          : "border-white/10 bg-white/5 hover:border-white/20")
      }
    >
      {badge && (
        <span className="inline-block self-start rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-black mb-3 max-w-full truncate">
          {badge}
        </span>
      )}

      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-white">{price}</span>
        <span className="text-sm text-white/60">{period}</span>
      </div>
      {subtext && (
        <p className="mt-1 text-xs text-white/50">{subtext}</p>
      )}
      <p className="mt-3 text-sm text-white/70">{description}</p>

      <ul className="mt-5 flex-1 space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-white/80">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {/* Cores explícitas em vez de variant pra não depender do tema do
          shadcn (a default estava saindo cinza claro contra o card claro
          do plano destacado, quase invisível). */}
      <Button
        onClick={onClick}
        disabled={disabled}
        className={
          "mt-6 w-full font-semibold " +
          (highlight
            ? "bg-green-500 hover:bg-green-400 text-[#0B1622] disabled:bg-green-500/50 disabled:text-[#0B1622]/60"
            : "bg-white/10 hover:bg-white/15 text-white border border-white/15")
        }
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Gerando PIX...
          </>
        ) : (
          ctaLabel
        )}
      </Button>
    </div>
  );
}
