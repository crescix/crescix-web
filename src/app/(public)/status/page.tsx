"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle, Loader2, RefreshCw } from "lucide-react";

/**
 * Página pública de status do serviço.
 *
 * Faz polling no /health/ready da crescix-api (probe que valida o DB
 * com timeout de 3s) a cada 30s. Roda 100% no client porque o ponto
 * é justamente medir do navegador do usuário — se a API responder mas
 * o usuário ver "fora" por CORS/firewall, ainda é problema dele
 * efetivamente.
 *
 * Não usa o axios-config porque não queremos passar Authorization nem
 * disparar interceptors de 401 — é uma chamada anônima simples.
 *
 * Boa prática: linkar essa página no footer do app e no rodapé do
 * e-mail "alguma coisa deu errado" — usuários frustrados batem aqui
 * antes de abrir ticket, e isso desafoga o suporte.
 */

type Status = "checking" | "ok" | "degraded" | "down";

interface CheckResult {
  status: Status;
  responseTimeMs: number | null;
  checkedAt: Date;
  /** Mensagem opcional (ex.: "503 service unavailable", "timeout"). */
  detail?: string;
}

const POLL_INTERVAL_MS = 30_000;
const REQUEST_TIMEOUT_MS = 8_000;

function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
}

async function checkApi(): Promise<CheckResult> {
  const start = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${getApiUrl()}/health/ready`, {
      signal: controller.signal,
      // Evita cache do browser e do CDN — queremos a leitura mais fresca.
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    clearTimeout(timer);
    const elapsed = Math.round(performance.now() - start);

    if (res.ok) {
      // Se demorou >2s pra responder o probe, consideramos degraded.
      // /health/ready faz um SELECT 1 no Prisma, deveria ser <300ms.
      const status: Status = elapsed > 2000 ? "degraded" : "ok";
      return {
        status,
        responseTimeMs: elapsed,
        checkedAt: new Date(),
        detail: status === "degraded" ? "Resposta lenta" : undefined,
      };
    }

    return {
      status: "down",
      responseTimeMs: elapsed,
      checkedAt: new Date(),
      detail: `HTTP ${res.status}`,
    };
  } catch (err) {
    clearTimeout(timer);
    const elapsed = Math.round(performance.now() - start);
    const detail =
      err instanceof DOMException && err.name === "AbortError"
        ? "Tempo esgotado (>8s)"
        : err instanceof Error
          ? err.message
          : "Erro desconhecido";
    return { status: "down", responseTimeMs: elapsed, checkedAt: new Date(), detail };
  }
}

export default function StatusPage() {
  const [result, setResult] = useState<CheckResult>({
    status: "checking",
    responseTimeMs: null,
    checkedAt: new Date(),
  });
  const [refreshing, setRefreshing] = useState(false);

  const run = useCallback(async () => {
    setRefreshing(true);
    const r = await checkApi();
    setResult(r);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    run();
    const id = setInterval(run, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [run]);

  return (
    <div className="w-full min-h-screen bg-app text-white">
      <div className="max-w-2xl mx-auto px-5 md:px-8 py-10 md:py-16">
        {/* ── Header ─────────────────────────────────────── */}
        <header className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-brand transition-colors mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar
          </Link>

          <div className="flex items-start gap-3 mb-3">
            <div className="h-11 w-11 rounded-2xl bg-brand/15 border border-brand/25 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-brand" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-brand font-semibold mb-1">
                Status
              </p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Status do serviço
              </h1>
              <p className="text-sm text-white/45 mt-1">
                Atualiza automaticamente a cada 30 segundos
              </p>
            </div>
          </div>
        </header>

        {/* ── Card principal ─────────────────────────────── */}
        <StatusCard result={result} onRetry={run} refreshing={refreshing} />

        {/* ── Subsistemas (futuro) ────────────────────────── */}
        <section className="mt-8 space-y-3">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Componentes
          </h2>
          <ComponentRow label="API" result={result} />
          <ComponentRow
            label="Banco de dados"
            result={result}
            note="checado via /health/ready"
          />
          <ComponentRow
            label="App web"
            result={{
              status: "ok",
              responseTimeMs: null,
              checkedAt: new Date(),
              detail: "Você está aqui",
            }}
            forceOk
          />
        </section>

        {/* ── Histórico/info ──────────────────────────────── */}
        <footer className="mt-10 pt-8 border-t border-white/10 text-sm text-white/55 space-y-3">
          <p>
            Se algo está fora,{" "}
            <a
              href="mailto:suporte@crescix.com.br"
              className="text-brand hover:text-brand-strong"
            >
              suporte@crescix.com.br
            </a>{" "}
            recebe e respondemos o mais rápido possível. Pra perda total
            do serviço, normalmente publicamos atualizações aqui antes
            mesmo de você precisar perguntar.
          </p>
          <p className="text-xs text-white/40">
            Esta página faz uma chamada anônima ao endpoint público{" "}
            <code className="bg-white/5 px-1.5 py-0.5 rounded text-white/60">
              /health/ready
            </code>{" "}
            da API. Nenhum dado seu é enviado.
          </p>
        </footer>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Componentes auxiliares
// ─────────────────────────────────────────────────────────────────────────────

function StatusCard({
  result,
  onRetry,
  refreshing,
}: {
  result: CheckResult;
  onRetry: () => void;
  refreshing: boolean;
}) {
  const v = visualFor(result.status);

  return (
    <div
      className={`rounded-2xl border p-6 md:p-8 ${v.cardBg} ${v.cardBorder}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-4">
        <div
          className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${v.iconBg}`}
        >
          <v.Icon className={`h-6 w-6 ${v.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl md:text-2xl font-bold text-white">
            {v.title}
          </h2>
          <p className="text-sm text-white/70 mt-1">{v.subtitle}</p>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-white/40 uppercase tracking-wider">
                Última verificação
              </div>
              <div className="text-white mt-0.5">
                {formatTimeAgo(result.checkedAt)}
              </div>
            </div>
            {result.responseTimeMs !== null && (
              <div>
                <div className="text-xs text-white/40 uppercase tracking-wider">
                  Tempo de resposta
                </div>
                <div className="text-white mt-0.5">
                  {result.responseTimeMs}ms
                </div>
              </div>
            )}
          </div>

          {result.detail && (
            <p className="mt-4 text-xs text-white/45 font-mono bg-white/5 rounded-lg px-3 py-2">
              {result.detail}
            </p>
          )}

          <button
            onClick={onRetry}
            disabled={refreshing}
            className="mt-5 inline-flex items-center gap-2 text-sm text-white/70 hover:text-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Verificando..." : "Verificar agora"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ComponentRow({
  label,
  result,
  note,
  forceOk,
}: {
  label: string;
  result: CheckResult;
  note?: string;
  forceOk?: boolean;
}) {
  const status: Status = forceOk ? "ok" : result.status;
  const v = visualFor(status);

  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <div>
        <div className="text-sm font-medium text-white">{label}</div>
        {note && <div className="text-xs text-white/45 mt-0.5">{note}</div>}
      </div>
      <div className={`flex items-center gap-2 text-sm ${v.iconColor}`}>
        <v.Icon className="h-4 w-4" />
        <span>{v.short}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Visual mapping
// ─────────────────────────────────────────────────────────────────────────────

function visualFor(status: Status) {
  switch (status) {
    case "ok":
      return {
        Icon: CheckCircle2,
        title: "Tudo funcionando",
        short: "Operacional",
        subtitle: "Não há incidentes em andamento.",
        cardBg: "bg-green-500/10",
        cardBorder: "border-green-500/30",
        iconBg: "bg-green-500/20",
        iconColor: "text-green-400",
      };
    case "degraded":
      return {
        Icon: AlertTriangle,
        title: "Funcionando com lentidão",
        short: "Degradado",
        subtitle:
          "O serviço está no ar mas respondendo mais devagar que o normal.",
        cardBg: "bg-amber-500/10",
        cardBorder: "border-amber-500/30",
        iconBg: "bg-amber-500/20",
        iconColor: "text-amber-400",
      };
    case "down":
      return {
        Icon: XCircle,
        title: "Serviço indisponível",
        short: "Fora do ar",
        subtitle:
          "Estamos investigando. Pedimos desculpas pelo transtorno — atualizamos esta página assim que tivermos mais informações.",
        cardBg: "bg-red-500/10",
        cardBorder: "border-red-500/30",
        iconBg: "bg-red-500/20",
        iconColor: "text-red-400",
      };
    case "checking":
    default:
      return {
        Icon: Loader2 as typeof CheckCircle2,
        title: "Verificando...",
        short: "Verificando",
        subtitle: "Consultando o serviço.",
        cardBg: "bg-white/5",
        cardBorder: "border-white/10",
        iconBg: "bg-white/10",
        iconColor: "text-white/60 animate-spin",
      };
  }
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return "agora";
  if (seconds < 60) return `há ${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `há ${minutes}min`;
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
