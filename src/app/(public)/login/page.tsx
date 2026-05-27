"use client";

import Link from "next/link";
import { Mail, Lock, Loader2, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthField } from "@/components/auth/auth-field";

/**
 * Avisos contextuais que aparecem acima do form quando o usuário chega
 * vindo de outra tela (signup ou confirmação de e-mail).
 *   ?registered=1 → "Conta criada, verifique seu e-mail"
 *   ?verified=1   → "E-mail confirmado, faça login"
 */
function LoginNotice() {
    const searchParams = useSearchParams();
    const registered = searchParams.get("registered") === "1";
    const verified = searchParams.get("verified") === "1";
    const emailHint = searchParams.get("email");

    if (verified) {
        return (
            <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <div className="flex-1 text-sm">
                    <p className="font-semibold text-green-200">E-mail confirmado!</p>
                    <p className="text-green-200/80 mt-1">
                        Sua conta está ativa. Faça login pra começar.
                    </p>
                </div>
            </div>
        );
    }

    if (registered) {
        return (
            <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
                <Mail className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1 text-sm">
                    <p className="font-semibold text-amber-200">Conta criada com sucesso!</p>
                    <p className="text-amber-200/80 mt-1">
                        Enviamos um link de confirmação{emailHint ? ` pra ${emailHint}` : ""}. Abra seu e-mail pra ativar a conta antes do primeiro login.
                    </p>
                    <Link
                        href={`/verificar-email${emailHint ? `?email=${encodeURIComponent(emailHint)}` : ""}`}
                        className="inline-block mt-2 text-xs font-semibold text-amber-300 hover:text-amber-100 transition-colors"
                    >
                        Não recebeu? Reenviar →
                    </Link>
                </div>
            </div>
        );
    }

    return null;
}

export default function LoginPage() {
    const { signIn, isAuthenticated } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    if (isAuthenticated) {
        router.replace("/dashboard");
        return null;
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await signIn({ email, password });
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "E-mail ou senha incorretos."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            title="Entrar"
            subtitle="Acesse o painel pra ver vendas, fluxo de caixa e relatórios."
            footerText="Ainda não possui uma conta?"
            footerLinkText="Cadastre-se"
            footerLinkHref="/cadastro"
        >
            <Suspense fallback={null}>
                <LoginNotice />
            </Suspense>
            <form className="space-y-5" onSubmit={handleLogin}>
                <AuthField
                    icon={Mail}
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    aria-label="E-mail"
                />

                <AuthField
                    icon={Lock}
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    aria-label="Senha"
                />

                <div className="flex justify-end">
                    <Link
                        href="/esqueci-senha"
                        className="text-xs text-white/50 hover:text-brand transition-colors"
                    >
                        Esqueceu a senha?
                    </Link>
                </div>

                {error && (
                    <div className="flex items-start gap-2 bg-red-500/10 border border-red-400/30 rounded-lg p-3 text-red-300 text-sm">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={loading}
                    className="
                        w-full h-12
                        bg-brand hover:bg-brand-strong
                        text-white font-semibold
                        rounded-lg
                        glow-brand glow-brand-hover
                        transition-base
                        disabled:opacity-60 disabled:cursor-not-allowed
                        group
                    "
                >
                    {loading ? (
                        <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Entrando...
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-2">
                            Acessar painel
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </span>
                    )}
                </Button>
            </form>
        </AuthShell>
    );
}
