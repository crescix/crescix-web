import * as Sentry from "@sentry/nextjs";

/**
 * Sentry — server side (rodando no Node.js do Vercel/Render).
 *
 * Captura erros que estouram em Server Components, Route Handlers e
 * Server Actions. Sem SENTRY_DSN é no-op total.
 */

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
    sendDefaultPii: false,
  });
}
