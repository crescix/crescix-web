"use client";

import Link from "next/link";
import { Mail, Lock, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthField } from "@/components/auth/auth-field";

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
