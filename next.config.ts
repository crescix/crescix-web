import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

/**
 * withSentryConfig faz upload automático de source maps no build
 * (quando SENTRY_AUTH_TOKEN está setado) e injeta o tunneling de
 * eventos pra evitar ad-blockers.
 *
 * Sem as envs (dev/CI), o wrapper continua funcionando mas pula o
 * upload de source maps — não quebra build.
 */
export default withSentryConfig(nextConfig, {
  // Org + project só são usadas pra source maps. Sem isso, o build
  // continua mas você não vê stack trace simbolizado no painel.
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Silencia o output do Sentry CLI quando rodando localmente.
  silent: !process.env.CI,

  // Source maps: tenta cobrir mais arquivos de cliente pra que
  // stack traces no painel apareçam simbolizados em vez do bundle
  // minificado.
  widenClientFileUpload: true,
});
