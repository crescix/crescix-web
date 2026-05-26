"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, Clock, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/auth-context";

/**
 * Banner global que avisa sobre estado da assinatura.
 *
 * Quando aparece:
 *   - status=TRIAL e daysRemaining <= 5  → aviso "faltam X dias"
 *   - status=EXPIRED/CANCELED            → bloqueio total ("teste acabou")
 *
 * Quando some:
 *   - status=ACTIVE → não há nada pra avisar
 *   - status=TRIAL com mais de 5 dias → não polui o app
 *   - estamos em /assinatura → CTA seria redundante
 *   - usuário ainda autenticando → evita flicker
 *
 * Cores:
 *   - amarelo (trial encerrando) — informativo
 *   - vermelho (expirou) — bloqueante
 */
export function SubscriptionBanner() {
  const { user, isAuthenticating } = useAuth();
  const pathname = usePathname();

  if (isAuthenticating || !user?.subscription) return null;

  const { status, daysRemaining } = user.subscription;

  // Não mostra na própria página de assinatura (não precisa empurrar pra lá)
  if (pathname === "/assinatura") return null;

  // ACTIVE — tudo certo, nada a mostrar
  if (status === "ACTIVE") return null;

  // Em TRIAL o banner aparece em todos os dias — o cliente precisa
  // saber desde o primeiro acesso que está num período limitado. A
  // urgência visual aumenta conforme o trial encerra.

  const isExpired = status === "EXPIRED" || status === "CANCELED";

  const baseClasses =
    "mx-4 mt-3 mb-1 rounded-xl px-4 py-3 flex items-center gap-3 text-sm transition-colors";

  if (isExpired) {
    return (
      <div
        className={`${baseClasses} bg-red-500/10 border border-red-500/30 text-red-100`}
        role="status"
      >
        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-red-200">
            {status === "CANCELED"
              ? "Sua assinatura foi cancelada."
              : "Seu período de teste acabou."}
          </p>
          <p className="text-xs text-red-200/80 hidden sm:block">
            Você ainda consegue consultar seus dados, mas para criar novos
            registros precisa renovar.
          </p>
        </div>
        <Link
          href="/assinatura"
          className="shrink-0 flex items-center gap-1 bg-red-500 hover:bg-red-400 text-white font-semibold text-xs sm:text-sm px-3 py-2 rounded-lg transition-colors"
        >
          <span className="hidden sm:inline">Renovar agora</span>
          <span className="sm:hidden">Renovar</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // TRIAL com 5 dias ou menos
  const isLastDay = daysRemaining <= 1;
  return (
    <div
      className={`${baseClasses} bg-amber-500/10 border border-amber-500/30 text-amber-100`}
      role="status"
    >
      <Clock className="w-5 h-5 text-amber-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-amber-200">
          {isLastDay
            ? "Seu teste acaba hoje."
            : `Faltam ${daysRemaining} dias do seu teste grátis.`}
        </p>
        <p className="text-xs text-amber-200/80 hidden sm:block">
          Garanta que não vai perder o acesso — assine agora a partir de
          R$ 49,90/mês.
        </p>
      </div>
      <Link
        href="/assinatura"
        className="shrink-0 flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-[#0B1622] font-semibold text-xs sm:text-sm px-3 py-2 rounded-lg transition-colors"
      >
        <span className="hidden sm:inline">Ver planos</span>
        <span className="sm:hidden">Planos</span>
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
