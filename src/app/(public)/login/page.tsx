"use client"

import Image from "next/image";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const { signIn, isAuthenticated } = useAuth();
    const router = useRouter();
    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [error, setError]       = useState("");
    const [loading, setLoading]   = useState(false);

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
        } catch (err: any) {
            setError(err.message || "Email ou senha inválidos.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row w-full max-w-[1000px] min-h-[600px] bg-white rounded-none md:rounded-3xl overflow-hidden shadow-2xl">

            <div className="flex flex-1 bg-primary md:p-12 flex-col items-center justify-center text-white relative">
                <h1 className="text-5xl font-black text-white tracking-tighter">
                    <span className="text-white">CRESC</span>
                    <span className="text-cyan opacity-80">IX</span>
                </h1>
                <p className="text-white font-medium">Crescendo o seu negócio</p>
                <h2 className="text-4xl font-bold mb-8 self-start w-full text-center">Bem-Vindo!</h2>
                <div className="relative lg:block hidden w-full aspect-square max-w-[400px]">
                    <Image
                        src="/login/login-storyset.svg"
                        alt="Login Illustration"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </div>

            <div className="flex-[1.2] flex flex-col p-8 md:p-16 bg-gray-100 justify-center">
                <div className="w-full max-w-sm mx-auto space-y-8">
                    <div className="space-y-2">
                        <h3 className="text-3xl font-bold text-primary md:text-gray-800">Entrar</h3>
                        <p className="hidden md:block text-sm text-gray-600 font-medium">
                            Gestão inteligente para o seu negócio!
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-0 bottom-2 h-5 w-5 text-primary md:text-gray-500" />
                                <Input
                                    type="email"
                                    placeholder="Digite seu email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="pl-8 border-t-0 border-x-0 border-b-2 border-primary md:border-gray-300 rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-primary transition-colors text-primary"
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-0 bottom-2 h-5 w-5 text-primary md:text-gray-500" />
                                <Input
                                    type="password"
                                    placeholder="Digite sua senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="pl-8 border-t-0 border-x-0 border-b-2 border-primary md:border-gray-300 rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-primary transition-colors text-primary"
                                />
                            </div>
                        </div>

                        {/* Mensagem de erro */}
                        {error && (
                            <p className="text-sm text-red-500 text-center font-medium">
                                {error}
                            </p>
                        )}

                        <div className="text-right">
                            <Link href="#" className="text-sm font-medium text-primary md:text-gray-600 hover:underline">
                                Esqueceu a senha?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-full text-lg font-semibold shadow-lg"
                        >
                            {loading ? "Entrando..." : "Acessar"}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-primary md:text-gray-600">
                        Ainda não possui uma conta?{" "}
                        <Link href="/cadastro" className="font-bold underline">
                            Cadastre-se
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
