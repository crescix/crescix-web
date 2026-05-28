"use client";

import { QrCode, CreditCard, ChevronRight, Repeat } from "lucide-react";
import {
  SubscriptionPlan,
  formatBRL,
  isCreditCardEnabled,
} from "@/services/assinatura";

/**
 * Tela "como você quer pagar?" — aparece depois que o cliente escolheu
 * o plano (mensal/anual), antes do checkout em si.
 *
 * Mostra 2 opções:
 *   1. PIX — cobrança única (sem auto-renovação)
 *   2. Cartão — cobrança recorrente (renova automaticamente)
 *
 * Esconde "Cartão" quando NEXT_PUBLIC_CREDIT_CARD_ENABLED=false. Útil
 * enquanto a Preapproval API ainda não está habilitada na conta MP.
 */

export type PaymentMethod = "pix" | "credit_card";

interface MethodPickerProps {
  plan: SubscriptionPlan;
  valor: number;
  onPick: (method: PaymentMethod) => void;
  onBack: () => void;
}

export function MethodPicker({
  plan,
  valor,
  onPick,
  onBack,
}: MethodPickerProps) {
  const planLabel = plan === "MENSAL" ? "Mensal" : "Anual";
  const cardEnabled = isCreditCardEnabled();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Como você quer pagar?
          </h2>
          <p className="text-sm text-white/60 mt-1">
            Plano {planLabel} · {formatBRL(valor)}
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-sm text-white/55 hover:text-white"
        >
          ← Trocar plano
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <MethodOption
          icon={QrCode}
          title="PIX"
          tagline="Pagamento único"
          description="Você paga 1x agora e a assinatura vale pelo período contratado. Sem renovação automática — quando faltar pouco, a gente avisa por e-mail."
          highlight="Sem cobrança recorrente"
          onClick={() => onPick("pix")}
        />

        {cardEnabled && (
          <MethodOption
            icon={CreditCard}
            title="Cartão"
            tagline="Renovação automática"
            description="A primeira cobrança é feita agora. Daí em diante, o Mercado Pago renova automaticamente até você cancelar. Sem precisar lembrar."
            highlight="Cancele quando quiser"
            recurring
            onClick={() => onPick("credit_card")}
          />
        )}
      </div>

      {!cardEnabled && (
        <p className="text-xs text-white/45 leading-relaxed">
          Pagamento por cartão estará disponível em breve. Por enquanto,
          o PIX cobre tudo — você pode escolher renovar automaticamente
          no futuro.
        </p>
      )}
    </div>
  );
}

interface MethodOptionProps {
  icon: typeof QrCode;
  title: string;
  tagline: string;
  description: string;
  highlight: string;
  recurring?: boolean;
  onClick: () => void;
}

function MethodOption({
  icon: Icon,
  title,
  tagline,
  description,
  highlight,
  recurring,
  onClick,
}: MethodOptionProps) {
  return (
    <button
      onClick={onClick}
      className="
        group relative text-left
        rounded-2xl border border-white/10 bg-white/5
        p-5 transition-base
        hover:border-brand/40 hover:bg-white/[0.07]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand
      "
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-brand/15 border border-brand/25 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-brand" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-white">{title}</h3>
            <ChevronRight className="h-4 w-4 text-white/40 group-hover:text-brand transition-colors" />
          </div>
          <p className="text-xs text-brand mt-0.5 flex items-center gap-1">
            {recurring && <Repeat className="h-3 w-3" />}
            {tagline}
          </p>
          <p className="text-sm text-white/65 mt-3 leading-relaxed">
            {description}
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-white/55">
            <span className="h-1 w-1 rounded-full bg-brand"></span>
            {highlight}
          </div>
        </div>
      </div>
    </button>
  );
}
