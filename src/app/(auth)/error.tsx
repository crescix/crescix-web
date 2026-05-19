"use client";

/**
 * Error boundary do grupo de rotas autenticadas. Fica dentro do
 * layout que tem Navbar + ProtectedRoute, então o usuário continua
 * navegando pelo header mesmo se uma rota específica explodir.
 *
 * Erros mais acima (no próprio layout (auth) ou no AuthProvider)
 * caem no `src/app/error.tsx` raiz.
 */

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function AuthSectionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[auth-section:error]", error);
  }, [error]);

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-16">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 mb-5">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>

        <h2 className="text-xl font-bold text-white mb-2">
          Não consegui carregar essa tela
        </h2>
        <p className="text-white/60 text-sm leading-relaxed mb-2">
          Tive um problema inesperado por aqui. Pode tentar de novo — quase
          sempre é coisa passageira.
        </p>

        {error.digest && (
          <p className="text-white/30 text-[11px] font-mono mt-3 mb-4">
            ref: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-brand-green hover:bg-brand-green/90 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar de novo
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors"
          >
            <Home className="w-4 h-4" />
            Ir pro dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
