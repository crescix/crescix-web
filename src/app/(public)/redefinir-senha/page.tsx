"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetPassword } from "@/services/password-reset";
import { extractApiError } from "@/lib/utils/api-errors";
import {
    STORAGE_TOKEN_KEY,
    STORAGE_USER_KEY,
} from "@/services/api/axios-config";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthField } from "@/components/auth/auth-field";

function RedefinirSenhaForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token") ?? "";

    const [password, setPassword] = useState("");
    const [confirma, setConfirma] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const tokenAusente = !token;

    useEffect(() => {
        if (!success) return;
        // Pós-redefinir, espera 1.5s e redireciona pro dashboard
        const t = setTimeout(() => router.push("/dashboard"), 1500);
        return () => clearTimeout(t);
    }, [success, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 8) {
            setError("A senha deve ter ao menos 8 caracteres.");
            return;
        }
        if (password !== confirma) {
            setError("As senhas não coincidem.");
            return;
        }

        setLoading(true);
        try {
            const { token: jwt, user } = await resetPassword(token, password);
            // Auto-login: o backend retorna JWT já válido
            localStorage.setItem(STORAGE_TOKEN_KEY, jwt);
            localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
            setSuccess(true);
        } catch (err) {
            setError(extractApiError(err, "Erro ao redefinir a senha."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            title="Redefinir senha"
            subtitle="Crie uma senha com ao menos 8 caracteres."
            leftHeadline="Quase pronto."
            leftSubheadline="Sua nova senha entra em vigor assim que confirmar."
        >
            <div className="space-y-5">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-brand transition-colors"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Voltar pro login
                </Link>

                {tokenAusente ? (
                    <div className="flex items-start gap-3 bg-red-500/10 border border-red-400/30 rounded-lg p-4 text-red-300">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-semibold text-white">
                                Link incompleto.
                            </p>
                            <p className="mt-1 text-white/70">
                                O link de redefinição parece estar quebrado.
                                Solicite um novo na tela{" "}
                                <Link
                                    href="/esqueci-senha"
                                    className="font-semibold text-brand hover:text-brand-strong"
                                >
                                    esqueci minha senha
                                </Link>
                                .
                            </p>
                        </div>
                    </div>
                ) : success ? (
                    <div className="flex items-start gap-3 bg-brand/10 border border-brand/30 rounded-lg p-4">
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5 text-brand" />
                        <div className="text-sm">
                            <p className="font-semibold text-white">
                                Senha redefinida.
                            </p>
                            <p className="mt-1 text-white/70">
                                Você já está logado. Redirecionando pro painel...
                            </p>
                        </div>
                    </div>
                ) : (
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <AuthField
                            icon={Lock}
                            type="password"
                            placeholder="Nova senha (mín. 8 caracteres)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            autoComplete="new-password"
                            aria-label="Nova senha"
                        />

                        <AuthField
                            icon={Lock}
                            type="password"
                            placeholder="Confirme a nova senha"
                            value={confirma}
                            onChange={(e) => setConfirma(e.target.value)}
                            required
                            minLength={8}
                            autoComplete="new-password"
                            aria-label="Confirmação da nova senha"
                        />

                        {error && (
                            <div className="flex items-start gap-2 bg-red-500/10 border border-red-400/30 rounded-lg p-3 text-red-300 text-sm">
                                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading || !password || !confirma}
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
                                    Salvando...
                                </span>
                            ) : (
                                "Redefinir senha"
                            )}
                        </Button>
                    </form>
                )}
            </div>
        </AuthShell>
    );
}

export default function RedefinirSenhaPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-app">
                    <Loader2 className="h-6 w-6 animate-spin text-brand" />
                </div>
            }
        >
            <RedefinirSenhaForm />
        </Suspense>
    );
}
