"use client";

import { useState } from "react";
import { Mail, X, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { resendVerification } from "@/services/email-verification";
import { useToast } from "@/components/ui/toast";
import { extractApiError } from "@/lib/utils/api-errors";

/**
 * Banner global que aparece pra usuários autenticados que ainda não
 * confirmaram o e-mail. Cliente pode usar o app normal — só fica o
 * lembrete pra ativar.
 *
 * Botão "Reenviar" chama /auth/resend-verification e mostra toast
 * informando que o e-mail foi disparado (resposta sempre uniforme).
 *
 * Botão X (fechar) esconde até o próximo carregamento da SPA. Em sessão
 * persistida via localStorage isso pode incomodar pouco mas mantemos
 * simples — o banner volta na próxima abertura.
 */
export function EmailVerificationBanner() {
  const { user, isAuthenticating } = useAuth();
  const toast = useToast();
  const [dismissed, setDismissed] = useState(false);
  const [resending, setResending] = useState(false);

  if (isAuthenticating || !user) return null;
  // Se o backend ainda não responder com emailVerified (campo opcional
  // pra compatibilidade), assume verificado pra não mostrar banner falso.
  if (user.emailVerified !== false) return null;
  if (dismissed) return null;

  async function handleResend() {
    if (!user) return;
    setResending(true);
    try {
      await resendVerification(user.email);
      toast.success(
        "Enviamos um novo link de confirmação. Confira sua caixa de entrada."
      );
    } catch (err) {
      toast.error(
        extractApiError(
          err,
          "Não consegui reenviar agora. Tente daqui a alguns minutos."
        )
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <div
      className="mx-4 mt-3 mb-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-100 px-4 py-3 flex items-center gap-3 text-sm"
      role="status"
    >
      <Mail className="w-5 h-5 text-amber-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-amber-200">
          Confirme seu e-mail
        </p>
        <p className="text-xs text-amber-200/80 hidden sm:block">
          Te enviamos um link para <strong>{user.email}</strong>. Abra seu
          e-mail e clique pra ativar a conta completamente.
        </p>
      </div>
      <button
        onClick={handleResend}
        disabled={resending}
        className="shrink-0 flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-[#0B1622] font-semibold text-xs px-3 py-2 rounded-lg transition-colors"
      >
        {resending ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="hidden sm:inline">Enviando...</span>
          </>
        ) : (
          <>
            <span className="hidden sm:inline">Reenviar link</span>
            <span className="sm:hidden">Reenviar</span>
          </>
        )}
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 text-amber-200/60 hover:text-amber-100 transition-colors"
        aria-label="Fechar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
