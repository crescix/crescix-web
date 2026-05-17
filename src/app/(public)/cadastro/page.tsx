"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, Lock, User, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerSchema, RegisterData } from "@/lib/validations/register";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { maskPhone } from "@/lib/utils/masks";

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
                    : "Erro ao criar conta. Tente novamente."
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
        <div className="flex flex-col md:flex-row w-full max-w-[1000px] min-h-[650px] bg-white rounded-none md:rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex flex-1 bg-primary md:p-12 flex-col items-center justify-center text-white relative">
                <h1 className="text-5xl font-black text-white tracking-tighter">
                    <span className="text-white">CRESC</span>
                    <span className="text-cyan ">IX</span>
                </h1>
                <p className="text-white font-medium">Crescendo o seu negócio</p>
                <h2 className="text-4xl font-bold mb-8 self-start w-full text-center">
                    Crie sua conta!
                </h2>
                <div className="relative lg:block hidden w-full aspect-square max-w-[400px]">
                    <Image
                        src="/login/login-storyset.svg"
                        alt="Register Illustration"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </div>

            <div className="flex-[1.2] flex flex-col p-8 md:p-16 bg-gray-100 justify-center">
                <div className="w-full max-w-sm mx-auto space-y-8">
                    <div className="space-y-2">
                        <h3 className="text-3xl font-bold text-primary md:text-gray-800">
                            Cadastre-se
                        </h3>
                        <p className="block text-sm text-gray-600 font-medium">
                            Preencha os dados abaixo para começar.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-4">
                            <div className="relative">
                                <User className="absolute left-0 bottom-2 h-5 w-5 text-primary md:text-gray-500" />
                                <Input
                                    {...register("name")}
                                    placeholder="Nome completo"
                                    className="pl-8 border-t-0 border-x-0 border-b-2 border-primary md:border-gray-300 rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-primary transition-colors text-primary"
                                />
                                {errors.name && (
                                    <span className="text-[10px] text-red-500 absolute -bottom-4 left-0">
                                        {errors.name.message}
                                    </span>
                                )}
                            </div>

                            <div className="relative">
                                <Mail className="absolute left-0 bottom-2 h-5 w-5 text-primary md:text-gray-500" />
                                <Input
                                    {...register("email")}
                                    type="email"
                                    placeholder="E-mail"
                                    className="pl-8 border-t-0 border-x-0 border-b-2 border-primary md:border-gray-300 rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-primary transition-colors text-primary"
                                />
                                {errors.email && (
                                    <span className="text-[10px] text-red-500 absolute -bottom-4 left-0">
                                        {errors.email.message}
                                    </span>
                                )}
                            </div>

                            <div className="relative">
                                <Phone className="absolute left-0 bottom-2 h-5 w-5 text-primary md:text-gray-500" />
                                <Input
                                    {...register("phone")}
                                    onInput={formatPhone}
                                    inputMode="numeric"
                                    placeholder="+55 (00) 00000-0000"
                                    className="pl-8 border-t-0 border-x-0 border-b-2 border-primary md:border-gray-300 rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-primary transition-colors text-primary"
                                />
                                {errors.phone && (
                                    <span className="text-[10px] text-red-500 absolute -bottom-4 left-0">
                                        {errors.phone.message}
                                    </span>
                                )}
                            </div>

                            
                            <div className="relative">
                                <Lock className="absolute left-0 bottom-2 h-5 w-5 text-primary md:text-gray-500" />
                                <Input
                                    {...register("password")}
                                    type="password"
                                    placeholder="Sua senha"
                                    className="pl-8 border-t-0 border-x-0 border-b-2 border-primary md:border-gray-300 rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-primary transition-colors text-primary"
                                />
                                {errors.password && (
                                    <span className="text-[10px] text-red-500 absolute -bottom-4 left-0">
                                        {errors.password.message}
                                    </span>
                                )}
                            </div>

                            
                            <div className="relative">
                                <Lock className="absolute left-0 bottom-2 h-5 w-5 text-primary md:text-gray-500" />
                                <Input
                                    {...register("confirmPassword")}
                                    type="password"
                                    placeholder="Confirme sua senha"
                                    className="pl-8 border-t-0 border-x-0 border-b-2 border-primary md:border-gray-300 rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-primary transition-colors text-primary"
                                />
                                {errors.confirmPassword && (
                                    <span className="text-[10px] text-red-500 absolute -bottom-4 left-0">
                                        {errors.confirmPassword.message}
                                    </span>
                                )}
                            </div>
                        </div>

                        {submitError && (
                            <p className="text-sm text-red-500 text-center font-medium">
                                {submitError}
                            </p>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white h-12 rounded-full text-lg font-semibold shadow-lg mt-4"
                        >
                            {loading ? "Criando conta..." : "Criar Conta"}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-primary md:text-gray-600">
                        Já possui uma conta?{" "}
                        <Link href="/login" className="font-bold underline">
                            Fazer Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}