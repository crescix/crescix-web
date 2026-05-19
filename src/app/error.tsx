"use client";

/**
 * Error boundary raiz. Renderiza quando uma rota explode em runtime
 * (erro em render, fetch sem catch, etc.). Fica abaixo do `layout.tsx`,
 * então AuthProvider/ToastProvider ainda funcionam aqui — podemos usar
 * componentes do design system normalmente.
 *
 * Erros no próprio `layout.tsx` caem no `global-error.tsx`.
 */

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Em produção, mandar pro provedor de telemetria (Sentry, Datadog).
    // Por enquanto, console.error já dá o stack no DevTools do usuário.
    console.error("[app:error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0B1622] flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          Alguma coisa deu errado
        </h1>
        <p className="text-white/60 text-sm leading-relaxed mb-2">
          Encontramos um problema inesperado nessa tela. Você pode tentar de
          novo — geralmente é só passageiro. Se continuar, dá um respiro e tenta
          mais tarde.
        </p>

        {error.digest && (
          <p className="text-white/30 text-[11px] font-mono mb-6 mt-4">
            ref: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-brand-green hover:bg-brand-green/90 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar de novo
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 py-3 rounded-lg font-semibold text-sm transition-colors"
          >
            <Home className="w-4 h-4" />
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
