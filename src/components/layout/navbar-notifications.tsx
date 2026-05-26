"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, ArrowDownCircle, ArrowUpCircle, X } from "lucide-react";
import { listContasPagar, type ContaPagar } from "@/services/contas-pagar";
import {
  listContasReceber,
  type ContaReceber,
} from "@/services/contas-receber";

/**
 * Sino de notificações da navbar.
 *
 * O que mostra:
 *   - Contas a pagar com status PENDENTE vencendo nos próximos 7 dias
 *     (inclui as já vencidas — backend mantém PENDENTE até alguém marcar)
 *   - Mesmo critério pra contas a receber
 *
 * Ordenação: urgência decrescente (vencida → vence hoje → vence breve),
 * depois por data ascendente dentro do mesmo grupo.
 *
 * Badge "não lido": hash da lista atual de IDs vs último hash visto. Quando
 * uma nova conta entra na janela (ou status muda), o badge volta. Hash em
 * localStorage — sem custo no backend.
 *
 * Refresh: a cada 2 minutos enquanto a aba está aberta. Suficiente pra
 * captar mudanças de status sem martelar a API.
 */

const STORAGE_KEY = "@Crescix:notif:lastSeenHash";
const REFRESH_INTERVAL_MS = 2 * 60 * 1000;
const FETCH_LIMIT = 50;

type Urgency = "VENCIDA" | "VENCE_HOJE" | "VENCE_BREVE";

interface Notification {
  id: string;
  kind: "PAGAR" | "RECEBER";
  descricao: string;
  valor: number;
  vencimento: string;
  urgency: Urgency;
  /** Dias até o vencimento. Negativo se já venceu. */
  diasAteVencer: number;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function diffDays(target: Date, base: Date): number {
  return Math.round(
    (target.getTime() - base.getTime()) / (24 * 60 * 60 * 1000)
  );
}

function classify(
  vencimento: string,
  today: Date
): Notification["urgency"] | null {
  const v = new Date(vencimento);
  v.setHours(0, 0, 0, 0);
  const days = diffDays(v, today);
  if (days < 0) return "VENCIDA";
  if (days === 0) return "VENCE_HOJE";
  if (days <= 7) return "VENCE_BREVE";
  return null;
}

function toNotif(
  conta: ContaPagar | ContaReceber,
  kind: "PAGAR" | "RECEBER",
  today: Date
): Notification | null {
  const urgency = classify(conta.vencimento, today);
  if (!urgency) return null;
  const v = new Date(conta.vencimento);
  v.setHours(0, 0, 0, 0);
  return {
    id: `${kind}-${conta.id}`,
    kind,
    descricao:
      conta.descricao ||
      (kind === "PAGAR" ? "Conta a pagar" : "Conta a receber"),
    valor: Number(conta.valor),
    vencimento: conta.vencimento,
    urgency,
    diasAteVencer: diffDays(v, today),
  };
}

const URGENCY_ORDER: Record<Urgency, number> = {
  VENCIDA: 0,
  VENCE_HOJE: 1,
  VENCE_BREVE: 2,
};

function sortNotifs(a: Notification, b: Notification): number {
  if (a.urgency !== b.urgency) {
    return URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency];
  }
  return a.vencimento.localeCompare(b.vencimento);
}

function formatBRL(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function urgencyLabel(n: Notification): string {
  if (n.urgency === "VENCIDA") {
    const dias = Math.abs(n.diasAteVencer);
    return `Vencida há ${dias} ${dias === 1 ? "dia" : "dias"}`;
  }
  if (n.urgency === "VENCE_HOJE") return "Vence hoje";
  return `Vence em ${n.diasAteVencer} ${
    n.diasAteVencer === 1 ? "dia" : "dias"
  }`;
}

export function NavbarNotifications() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const loadNotifs = useCallback(async () => {
    const today = startOfToday();
    const limit = new Date(today);
    limit.setDate(limit.getDate() + 7);
    const limitISO = limit.toISOString();

    try {
      const [pagar, receber] = await Promise.all([
        listContasPagar({
          status: "PENDENTE",
          vencimentoTo: limitISO,
          limit: FETCH_LIMIT,
        }),
        listContasReceber({
          status: "PENDENTE",
          vencimentoTo: limitISO,
          limit: FETCH_LIMIT,
        }),
      ]);

      const all: Notification[] = [
        ...pagar.data
          .map((c) => toNotif(c, "PAGAR", today))
          .filter((n): n is Notification => n !== null),
        ...receber.data
          .map((c) => toNotif(c, "RECEBER", today))
          .filter((n): n is Notification => n !== null),
      ].sort(sortNotifs);

      setNotifs(all);

      const currentHash = all.map((n) => n.id).join("|");
      const lastHash = localStorage.getItem(STORAGE_KEY);
      setHasUnread(all.length > 0 && currentHash !== lastHash);
    } catch (err) {
      // Sino não é crítico — falha silenciosa pra não bagunçar o app.
      console.warn("[notifications] falha ao buscar:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifs();
    const interval = setInterval(loadNotifs, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadNotifs]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  function handleToggle() {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen) {
      const currentHash = notifs.map((n) => n.id).join("|");
      localStorage.setItem(STORAGE_KEY, currentHash);
      setHasUnread(false);
    }
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={handleToggle}
        className="hidden md:flex relative w-10 h-10 items-center justify-center rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors"
        title="Notificações"
        aria-label="Notificações"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Bell className="w-4 h-4 text-white/60" />
        {hasUnread && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500 ring-2 ring-[#0B1622]" />
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 sm:w-96 z-50 rounded-2xl border border-white/10 bg-[#0B1622]/95 backdrop-blur-md shadow-2xl overflow-hidden"
          role="menu"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-sm font-semibold text-white">Notificações</h3>
            <button
              onClick={() => setOpen(false)}
              className="text-white/50 hover:text-white/80 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-6 text-center text-sm text-white/50">
                Carregando...
              </div>
            ) : notifs.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="text-3xl mb-2">🎉</div>
                <p className="text-sm font-medium text-white">Tudo em dia!</p>
                <p className="text-xs text-white/50 mt-1">
                  Nada vencendo nos próximos 7 dias.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {notifs.map((n) => (
                  <li key={n.id}>
                    <NotificationRow
                      notif={n}
                      onClick={() => setOpen(false)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {notifs.length > 0 && (
            <div className="flex border-t border-white/10 text-xs">
              <Link
                href="/financeiro/pagar"
                onClick={() => setOpen(false)}
                className="flex-1 px-4 py-3 text-center text-white/70 hover:bg-white/5 hover:text-white transition-colors"
              >
                Ver contas a pagar
              </Link>
              <div className="w-px bg-white/10" />
              <Link
                href="/financeiro/receber"
                onClick={() => setOpen(false)}
                className="flex-1 px-4 py-3 text-center text-white/70 hover:bg-white/5 hover:text-white transition-colors"
              >
                Ver a receber
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationRow({
  notif,
  onClick,
}: {
  notif: Notification;
  onClick: () => void;
}) {
  const href =
    notif.kind === "PAGAR" ? "/financeiro/pagar" : "/financeiro/receber";
  const Icon = notif.kind === "PAGAR" ? ArrowUpCircle : ArrowDownCircle;
  const iconColor =
    notif.kind === "PAGAR" ? "text-red-400" : "text-green-400";
  const urgencyColor =
    notif.urgency === "VENCIDA"
      ? "text-red-400"
      : notif.urgency === "VENCE_HOJE"
        ? "text-amber-400"
        : "text-white/50";

  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {notif.descricao}
        </p>
        <div className="flex items-center justify-between mt-0.5 gap-2">
          <span className={`text-xs ${urgencyColor}`}>
            {urgencyLabel(notif)} · {formatDate(notif.vencimento)}
          </span>
          <span className="text-xs font-semibold text-white/80 shrink-0">
            {formatBRL(notif.valor)}
          </span>
        </div>
      </div>
    </Link>
  );
}
