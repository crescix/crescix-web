"use client";

import { useEffect, useState } from "react";
import {
  Check, Clock, AlertTriangle, CreditCard, Sparkles, ShieldCheck,
} from "lucide-react";
import {
  getAssinaturaStatus,
  type AssinaturaStatus,
  type PlanoAssinatura,
} from "@/services/assinatura";
import { extractApiError } from "@/lib/utils/api-errors";

/**
 * Tela de Assinatura.
 *
 * Mostra:
 *   - Status atual (TRIAL / ACTIVE / EXPIRED / CANCELED)
 *   - Dias restantes (quando aplicável)
 *   - 2 planos disponíveis com CTA "Assinar"
 *
 * Por enquanto o botão "Assinar" só mostra um aviso — a integração com
 * Mercado Pago entra no Sprint 4 (S4). O usuário não fica travado: dá
 * pra continuar usando o app em modo read-only até a integração subir.
 */
export default function AssinaturaPage() {
  const [status, setStatus] = useState<AssinaturaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getAssinaturaStatus()
      .then((data) => alive && setStatus(data))
      .catch((err) => alive && setError(extractApiError(err, "Não consegui carregar o status da sua assinatura.")))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Sua assinatura
        </h1>
        <p className="text-white/60 text-sm mt-1">
          Veja como está sua conta e escolha o plano que cabe no seu bolso.
        </p>
      </header>

      {loading && <StatusSkeleton />}

      {!loading && error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 text-sm">
          {error}
        </div>
      )}

      {!loading && status && (
        <>
          <StatusCard status={status} />

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-white mb-1">
              Escolha seu plano
            </h2>
            <p className="text-white/60 text-sm mb-6">
              Sem assinatura automática. Você paga uma vez e usa pelo período contratado.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PlanoCard
                plano={status.plans.MENSAL}
                destaque={false}
              />
              <PlanoCard
                plano={status.plans.ANUAL}
                destaque
                economiaTexto={calcularEconomia(status.plans.MENSAL, status.plans.ANUAL)}
              />
            </div>
          </section>

          <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Beneficio
              icon={<ShieldCheck className="w-5 h-5 text-green-400" />}
              titulo="Sem auto-renovação"
              texto="Você renova manualmente quando quiser. Nada é cobrado escondido."
            />
            <Beneficio
              icon={<Sparkles className="w-5 h-5 text-green-400" />}
              titulo="Tudo incluso"
              texto="WhatsApp, Telegram, dashboard, insights — sem upgrades surpresa."
            />
            <Beneficio
              icon={<CreditCard className="w-5 h-5 text-green-400" />}
              titulo="PIX ou cartão"
              texto="Em breve: pagamento via Mercado Pago com PIX, crédito ou boleto."
            />
          </section>
        </>
      )}
    </div>
  );
}

// ─── Status card ─────────────────────────────────────────────────────────────

function StatusCard({ status }: { status: AssinaturaStatus }) {
  if (status.status === "ACTIVE") {
    return (
      <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
          <Check className="w-6 h-6 text-green-400" />
        </div>
        <div className="flex-1">
          <p className="text-green-200 font-semibold">Assinatura ativa</p>
          <p className="text-green-200/80 text-sm">
            {status.subscriptionEndsAt ? (
              <>
                Válida até{" "}
                <strong>{formatarData(status.subscriptionEndsAt)}</strong>
                {" · "}
                {status.daysRemaining} {status.daysRemaining === 1 ? "dia restante" : "dias restantes"}
              </>
            ) : (
              "Aproveite tudo que o CrescIX tem a oferecer."
            )}
          </p>
        </div>
      </div>
    );
  }

  if (status.status === "TRIAL") {
    const urgente = status.daysRemaining <= 5;
    return (
      <div
        className={`rounded-2xl border p-5 flex items-center gap-4 ${
          urgente
            ? "border-amber-500/30 bg-amber-500/10"
            : "border-white/10 bg-white/[0.03]"
        }`}
      >
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            urgente ? "bg-amber-500/20" : "bg-white/5"
          }`}
        >
          <Clock
            className={`w-6 h-6 ${urgente ? "text-amber-400" : "text-white/60"}`}
          />
        </div>
        <div className="flex-1">
          <p className={`font-semibold ${urgente ? "text-amber-200" : "text-white"}`}>
            Você está no teste grátis
          </p>
          <p className={`text-sm ${urgente ? "text-amber-200/80" : "text-white/60"}`}>
            {status.daysRemaining > 0 ? (
              <>
                Faltam <strong>{status.daysRemaining}</strong>{" "}
                {status.daysRemaining === 1 ? "dia" : "dias"}
                {status.trialEndsAt && (
                  <> · termina em {formatarData(status.trialEndsAt)}</>
                )}
              </>
            ) : (
              "Seu teste termina hoje."
            )}
          </p>
        </div>
      </div>
    );
  }

  // EXPIRED ou CANCELED
  const cancelado = status.status === "CANCELED";
  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-red-400" />
      </div>
      <div className="flex-1">
        <p className="text-red-200 font-semibold">
          {cancelado ? "Assinatura cancelada" : "Período de teste encerrado"}
        </p>
        <p className="text-red-200/80 text-sm">
          Sua conta está em modo somente-leitura. Renove abaixo para voltar a criar registros.
        </p>
      </div>
    </div>
  );
}

// ─── Plano card ──────────────────────────────────────────────────────────────

function PlanoCard({
  plano,
  destaque,
  economiaTexto,
}: {
  plano: PlanoAssinatura;
  destaque: boolean;
  economiaTexto?: string;
}) {
  const mensal = plano.code === "ANUAL" ? plano.valor / 12 : plano.valor;

  return (
    <div
      className={`relative rounded-2xl border p-6 flex flex-col ${
        destaque
          ? "border-green-500/40 bg-gradient-to-b from-green-500/10 to-transparent shadow-lg shadow-green-500/5"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      {destaque && (
        <span className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-green-500 text-[#0B1622] text-xs font-bold">
          Recomendado
        </span>
      )}

      <h3 className="text-lg font-semibold text-white">{plano.label}</h3>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-white">
          {formatBRL(mensal)}
        </span>
        <span className="text-white/50 text-sm">/mês</span>
      </div>

      {plano.code === "ANUAL" && (
        <p className="text-xs text-white/50 mt-1">
          Pagos {formatBRL(plano.valor)} uma vez por ano
        </p>
      )}
      {plano.code === "MENSAL" && (
        <p className="text-xs text-white/50 mt-1">Pago todo mês</p>
      )}

      {economiaTexto && (
        <p className="mt-2 text-xs font-semibold text-green-400">
          {economiaTexto}
        </p>
      )}

      <ul className="mt-5 space-y-2.5 text-sm text-white/80 flex-1">
        <Item>Acesso completo ao app web</Item>
        <Item>Bots de WhatsApp e Telegram</Item>
        <Item>Insights mensais com IA</Item>
        <Item>{plano.days} dias de acesso</Item>
      </ul>

      <button
        onClick={() => {
          alert(
            "Integração com Mercado Pago em breve. Avisaremos por e-mail quando ficar pronta."
          );
        }}
        className={`mt-6 h-11 rounded-xl font-semibold text-sm transition-colors ${
          destaque
            ? "bg-green-500 hover:bg-green-400 text-[#0B1622]"
            : "bg-white/10 hover:bg-white/15 text-white"
        }`}
      >
        Assinar {plano.label}
      </button>
    </div>
  );
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
      <span>{children}</span>
    </li>
  );
}

// ─── Beneficio ───────────────────────────────────────────────────────────────

function Beneficio({
  icon, titulo, texto,
}: {
  icon: React.ReactNode;
  titulo: string;
  texto: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-white font-semibold text-sm">{titulo}</p>
      <p className="text-white/60 text-xs mt-1 leading-relaxed">{texto}</p>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function StatusSkeleton() {
  return (
    <>
      <div className="h-20 rounded-2xl bg-white/[0.04] animate-pulse" />
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-72 rounded-2xl bg-white/[0.04] animate-pulse" />
        <div className="h-72 rounded-2xl bg-white/[0.04] animate-pulse" />
      </div>
    </>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBRL(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function formatarData(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function calcularEconomia(
  mensal: PlanoAssinatura,
  anual: PlanoAssinatura
): string | undefined {
  const valorAnualSeFosseMensal = mensal.valor * 12;
  const economia = valorAnualSeFosseMensal - anual.valor;
  if (economia <= 0) return undefined;
  return `Economize ${formatBRL(economia)} por ano`;
}
