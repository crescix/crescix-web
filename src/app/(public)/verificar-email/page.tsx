"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyEmail, resendVerification } from "@/services/email-verification";
import { extractApiError } from "@/lib/utils/api-errors";
import { AuthShell } from "@/components/auth/auth-shell";

/**
 * Página de verificação de e-mail.
 *
 * Cliente chega aqui por 2 caminhos:
 *   1. Clicando no link do e-mail (`?token=xxx`) → verificação automática
 *   2. Direto (sem token) → mostra explicação + botão de reenviar
 *
 * Em sucesso, redireciona pra /login com toast. Em erro, oferece
 * reenviar o link.
 */
function VerificarEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const emailHint = searchParams.get("email") ?? ""; // opcional, pra UX

  type Status =
    | "idle"             // sem token, página de informação
    | "verifying"        // tentando verificar
    | "success"          // verificou OK
    | "invalid_token"    // token inválido/expirado
    | "error";           // erro de rede ou similar

  const [status, setStatus] = useState<Status>(token ? "verifying" : "idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState(emailHint);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  // Tenta verificar quando chega com token
  useEffect(() => {
    if (!token) return;
    let alive = true;
    (async () => {
      try {
        await verifyEmail(token);
        if (!alive) return;
        setStatus("success");
      } catch (err) {
        if (!alive) return;
        const msg = extractApiError(
          err,
          "Não consegui validar esse link agora."
        );
        // Se a mensagem indica que o token é inválido, deixa o user
        // pedir um novo. Outros erros (rede etc.) caem no estado genérico.
        if (msg.toLowerCase().includes("inválido") || msg.toLowerCase().includes("expirado")) {
          setStatus("invalid_token");
        } else {
          setStatus("error");
        }
        setErrorMessage(msg);
      }
    })();
    return () => {
      alive = false;
    };
  }, [token]);

  // Após sucesso, espera 2s mostrando o feedback e manda pra /login
  useEffect(() => {
    if (status !== "success") return;
    const t = setTimeout(() => router.push("/login?verified=1"), 2000);
    return () => clearTimeout(t);
  }, [status, router]);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    if (!resendEmail) return;
    setResending(true);
    setResendMessage(null);
    try {
      const result = await resendVerification(resendEmail);
      setResendMessage(result.message);
    } catch (err) {
      setResendMessage(
        extractApiError(
          err,
          "Não consegui processar a solicitação. Tente daqui a alguns minutos."
        )
      );
    } finally {
      setResending(false);
    }
  }

  // ─── Sucesso ──────────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-8 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-green-400" />
        <h1 className="mt-4 text-xl font-semibold text-white">
          E-mail confirmado!
        </h1>
        <p className="mt-2 text-sm text-white/70">
          Sua conta está pronta. Te mandamos pra tela de login em instantes...
        </p>
      </div>
    );
  }

  // ─── Verificando ──────────────────────────────────────────────────────────
  if (status === "verifying") {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-white/60" />
        <p className="mt-4 text-sm text-white/70">Confirmando seu e-mail...</p>
      </div>
    );
  }

  // ─── Idle / Token inválido / Erro: tudo cai num form de reenviar ─────────
  const isError = status === "invalid_token" || status === "error";

  return (
    <div className="space-y-6">
      <div
        className={
          "rounded-2xl border p-6 " +
          (isError
            ? "border-red-500/30 bg-red-500/10"
            : "border-white/10 bg-white/5")
        }
      >
        <div className="flex items-start gap-3">
          {isError ? (
            <AlertCircle className="h-6 w-6 shrink-0 text-red-400" />
          ) : (
            <Mail className="h-6 w-6 shrink-0 text-white/60" />
          )}
          <div>
            <h1 className="text-lg font-semibold text-white">
              {isError ? "Não consegui confirmar" : "Confirme seu e-mail"}
            </h1>
            <p className="mt-1 text-sm text-white/70">
              {isError
                ? errorMessage
                : "Te mandamos um link de confirmação. Abra seu e-mail e clique no botão pra ativar a conta."}
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleResend}
        className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4"
      >
        <div>
          <h2 className="text-sm font-semibold text-white">
            Reenviar o link
          </h2>
          <p className="mt-1 text-xs text-white/60">
            Digite o e-mail que você usou no cadastro e enviaremos um novo
            link em instantes.
          </p>
        </div>

        <div>
          <label
            htmlFor="resend-email"
            className="block text-xs font-medium text-white/60 mb-1.5"
          >
            E-mail
          </label>
          <input
            id="resend-email"
            type="email"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full h-11 px-3 rounded-lg border border-white/10 bg-black/30 text-white placeholder:text-white/30 outline-none focus:border-green-500/50 transition-colors"
            required
          />
        </div>

        {resendMessage && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-xs text-green-200">
            {resendMessage}
          </div>
        )}

        <Button
          type="submit"
          disabled={resending || !resendEmail}
          className="w-full bg-green-500 hover:bg-green-400 text-[#0B1622] font-semibold disabled:bg-green-500/50"
        >
          {resending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Reenviar link de confirmação"
          )}
        </Button>
      </form>

      <Link
        href="/login"
        className="flex items-center justify-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar pro login
      </Link>
    </div>
  );
}

export default function VerificarEmailPage() {
  return (
    <AuthShell
      title="Confirme seu e-mail"
      subtitle="Falta só um clique pra ativar sua conta."
      footerText="Lembrou da senha?"
      footerLinkText="Fazer login"
      footerLinkHref="/login"
    >
      <Suspense
        fallback={
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-white/60" />
          </div>
        }
      >
        <VerificarEmailContent />
      </Suspense>
    </AuthShell>
  );
}
