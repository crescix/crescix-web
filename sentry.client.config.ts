import * as Sentry from "@sentry/nextjs";

/**
 * Sentry — client side (rodando no browser do usuário).
 *
 * Inicializa só se NEXT_PUBLIC_SENTRY_DSN estiver setada. Em dev (sem
 * DSN) é no-op total — erros continuam só no console do navegador, sem
 * custo de quota.
 *
 * Capturamos exceptions não tratadas + erros em handlers de evento.
 * O tracesSampleRate fica baixo (10% em prod) pra caber no plano free
 * do Sentry (5k events/mês).
 */

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
    // Não enviamos PII por padrão — JWT/headers de auth não devem
    // sair daqui pra Sentry.
    sendDefaultPii: false,
    // Reduz ruído: ignora erros conhecidos do browser que não são
    // acionáveis (extensões, network flaky, etc).
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      "Non-Error promise rejection captured",
      "Network Error",
    ],
  });
}
