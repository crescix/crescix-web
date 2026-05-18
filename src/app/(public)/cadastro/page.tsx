"use client";

import Link from "next/link";
import { Mail, Lock, User, Phone, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { registerSchema, RegisterData } from "@/lib/validations/register";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { maskPhone } from "@/lib/utils/masks";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthField } from "@/components/auth/auth-field";

export default function RegisterPage() {
    const { signUp, signOut } = useAuth();
    const [submitError, setSubmitError] = useState("");
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<RegisterData>({
        resolver: zodResolver(registerSchema),
    });

    const formatPhone = (e: React.FormEvent<HTMLInputElement>) => {
        setValue("phone", maskPhone(e.currentTarget.value));
    };

    const onSubmit = async (data: RegisterData) => {
        setSubmitError("");
        setLoading(true);
        try {
            await signUp({
                name: data.name,
                email: data.email,
                phone: data.phone,
                password: data.password,
            });
            // signUp redireciona para /dashboard em sucesso
        } catch (err) {
            setSubmitError(
                err instanceof Error
                    ? err.message
                    : "Não consegui criar a conta agora. Tente novamente."
            );
        } finally {
            setLoading(false);
        }
    };

    // Garante que ao chegar na tela de cadastro o usuário está deslogado
    useEffect(() => {
        signOut();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AuthShell
            title="Criar conta"
            subtitle="Tudo o que você precisa pra começar a usar a CrescIX."
            footerText="Já possui uma conta?"
            footerLinkText="Fazer login"
            footerLinkHref="/login"
            leftHeadline="Setup em 2 minutos."
            leftSubheadline="Cadastro, pareamento do Telegram e primeira venda registrada. Tudo no mesmo dia."
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <AuthField
                    icon={User}
                    placeholder="Nome completo"
                    autoComplete="name"
                    error={errors.name?.message}
                    {...register("name")}
                />

                <AuthField
                    icon={Mail}
                    type="email"
                    placeholder="seu@email.com"
                    autoComplete="email"
                    error={errors.email?.message}
                    {...register("email")}
                />

                <AuthField
                    icon={Phone}
                    inputMode="numeric"
                    placeholder="+55 (00) 00000-0000"
                    autoComplete="tel"
                    error={errors.phone?.message}
                    {...register("phone")}
                    onInput={formatPhone}
                />

                <AuthField
                    icon={Lock}
                    type="password"
                    placeholder="Sua senha (mín. 8 caracteres)"
                    autoComplete="new-password"
                    error={errors.password?.message}
                    {...register("password")}
                />

                <AuthField
                    icon={Lock}
                    type="password"
                    placeholder="Confirme sua senha"
                    autoComplete="new-password"
                    error={errors.confirmPassword?.message}
                    {...register("confirmPassword")}
                />

                {/* ── Consentimento LGPD ─────────────────────────────────
                    Checkbox obrigatória pra ter consentimento explícito
                    do tratamento de dados, conforme art. 7º, I da LGPD. */}
                <div className="pt-2">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            {...register("aceitouTermos")}
                            className="
                                mt-0.5 h-4 w-4
                                rounded
                                border-white/20 bg-elevated
                                accent-brand
                                cursor-pointer
                                flex-shrink-0
                            "
                        />
                        <span className="text-xs text-white/65 leading-relaxed group-hover:text-white/85 transition-colors">
                            Li e concordo com os{" "}
                            <Link
                                href="/termos"
                                target="_blank"
                                className="text-brand hover:text-brand-strong underline underline-offset-2"
                            >
                                Termos de uso
                            </Link>{" "}
                            e a{" "}
                            <Link
                                href="/privacidade"
                                target="_blank"
                                className="text-brand hover:text-brand-strong underline underline-offset-2"
                            >
                                Política de Privacidade
                            </Link>
                            .
                        </span>
                    </label>
                    {errors.aceitouTermos && (
                        <p className="text-xs text-red-400 mt-1.5 pl-7">
                            {errors.aceitouTermos.message}
                        </p>
                    )}
                </div>

                {submitError && (
                    <div className="flex items-start gap-2 bg-red-500/10 border border-red-400/30 rounded-lg p-3 text-red-300 text-sm">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>{submitError}</span>
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={loading}
                    className="
                        w-full h-12 mt-2
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
                            Criando conta...
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-2">
                            Criar conta
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </span>
                    )}
                </Button>
            </form>
        </AuthShell>
    );
}
