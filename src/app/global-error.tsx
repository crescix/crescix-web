"use client";

/**
 * Global error boundary do App Router.
 *
 * Renderiza quando algo explode acima do `error.tsx` raiz — geralmente
 * problemas no próprio `layout.tsx` (provider quebrado, font failing, etc.).
 * Aqui NÃO temos AuthProvider/ToastProvider/CookieBanner porque eles é que
 * podem estar falhando — por isso o markup é deliberadamente mínimo,
 * sem dependências externas além do CSS global.
 */

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Em produção, esse seria o ponto de mandar pro Sentry/Datadog.
    // Por enquanto, console.error é suficiente — em desenvolvimento
    // o stack já aparece na tela do Next overlay.
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="pt-br">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#0B1622",
          color: "#fff",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: -1,
              marginBottom: 32,
            }}
          >
            <span style={{ color: "#fff" }}>CRESC</span>
            <span style={{ color: "#22C55E" }}>IX</span>
          </div>
          <h1 style={{ fontSize: 22, margin: "0 0 12px 0" }}>
            Alguma coisa deu errado
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 14,
              lineHeight: 1.6,
              margin: "0 0 24px 0",
            }}
          >
            Encontramos um problema inesperado ao carregar essa tela. Você pode
            tentar de novo — geralmente é só passageiro.
          </p>
          {error.digest && (
            <p
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: 11,
                fontFamily: "monospace",
                margin: "0 0 24px 0",
              }}
            >
              ref: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              background: "#22C55E",
              color: "#fff",
              border: "none",
              padding: "12px 24px",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Tentar de novo
          </button>
        </div>
      </body>
    </html>
  );
}
