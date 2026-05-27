/**
 * Hook do Next.js que roda ANTES de qualquer Server Component / Route
 * Handler. Aqui carregamos o config do Sentry conforme o runtime
 * (Node.js completo vs edge). Sem isso, server-side errors não chegam
 * no Sentry mesmo com o SDK instalado.
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

// Repassa erros de Server Component pro Sentry. Sem isso, esses
// erros só aparecem como 500 genérico no log do Vercel/Render.
export { captureRequestError as onRequestError } from "@sentry/nextjs";
