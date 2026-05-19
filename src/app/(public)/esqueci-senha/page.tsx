"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { forgotPassword } from "@/services/password-reset";
import { extractApiError } from "@/lib/utils/api-errors";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthField } from "@/components/auth/auth-field";

export default function EsqueciSenhaPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await forgotPassword(email);
            setSent(true);
        } catch (err) {
            setError(extractApiError(err, "Não consegui processar agora. Tente novamente."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            title="Recuperar acesso"
            subtitle="Informe o e-mail cadastrado e enviaremos um link para criar uma nova senha."
            footerText="Lembrou a senha?"
            footerLinkText="Entrar"
            footerLinkHref="/login"
            leftHeadline="Recupere o acesso em 1 minuto."
            leftSubheadline="Link de redefinição por e-mail, válido por 30 minutos."
        >
            <div className="space-y-5">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-brand transition-colors"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Voltar pro login
                </Link>

                {sent ? (
                    <div className="flex items-start gap-3 bg-brand/10 border border-brand/30 rounded-lg p-4 text-brand">
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-semibold text-white">
                                Verifique seu e-mail.
                            </p>
                            <p className="mt-1 text-white/70">
                                Se{" "}
                                <span className="font-medium text-white">
                                    {email}
                                </span>{" "}
                                estiver cadastrado, você receberá um link de
                                redefinição em instantes. O link expira em 30
                                minutos.
                            </p>
                        </div>
                    </div>
                ) : (
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <AuthField
                            icon={Mail}
                            type="email"
                            placeholder="Seu e-mail cadastrado"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            aria-label="E-mail"
                        />

                        {error && (
                            <div className="flex items-start gap-2 bg-red-500/10 border border-red-400/30 rounded-lg p-3 text-red-300 text-sm">
                                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading || !email}
                            className="
                                w-full h-12
                                bg-brand hover:bg-brand-strong
                                text-white font-semibold
                                rounded-lg
                                glow-brand glow-brand-hover
                                transition-base
                                disabled:opacity-60 disabled:cursor-not-allowed
                            "
                        >
                            {loading ? (
                                <span className="inline-flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Enviando...
                                </span>
                            ) : (
                                "Enviar link"
                            )}
                        </Button>
                    </form>
                )}
            </div>
        </AuthShell>
    );
}
