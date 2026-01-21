import Image from "next/image";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
    return (

        <div className="flex flex-col md:flex-row w-full max-w-[1000px] min-h-[600px] bg-white rounded-none md:rounded-3xl overflow-hidden shadow-2xl">

            <div className="flex flex-1 bg-primary md:p-12 flex-col items-center justify-center text-white relative">
                <h1 className="text-5xl font-black text-white tracking-tighter ">
                    <span className="text-white ">CRESC</span>
                    <span className="text-cyan opacity-80">IX</span>

                </h1>

                <p className="text-white  font-medium">Crescendo o seu negócio</p>
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

                    <form className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-0 bottom-2 h-5 w-5 text-primary md:text-gray-500" />
                                <Input
                                    type="email"
                                    placeholder="Digite seu email"
                                    className="pl-8 border-t-0 border-x-0 border-b-2 border-primary md:border-gray-300 rounded-none bg-transparent selection:bg-secondary focus-visible:ring-0 focus-visible:border-primary transition-colors text-primary"
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-0 bottom-2 h-5 w-5 text-primary md:text-gray-500" />
                                <Input
                                    type="password"
                                    placeholder="Digite sua senha"
                                    className="pl-8 border-t-0 border-x-0 border-b-2 border-primary md:border-gray-300 rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-primary transition-colors selection:bg-secondary   text-primary"
                                />
                            </div>
                        </div>

                        <div className="text-right">
                            <Link href="#" className="text-sm font-medium text-primary md:text-gray-600 hover:underline">
                                Esqueceu a senha?
                            </Link>
                        </div>

                        <Button className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-full text-lg font-semibold shadow-lg">
                            Acessar
                        </Button>

                        {/* Implementação com o Google Posteriormente */}
                        {/*
                            <div className="relative flex items-center justify-center py-2">
                                <span className="bg-gray-100 px-2 text-sm text-gray-500 z-10">ou</span>
                                <div className="absolute w-full border-t border-gray-300"></div>
                            </div>

                            <Button 
                                variant="outline" 
                                type="button"
                                className="w-full h-12 rounded-full border-2 border-primary/20 bg-blue-900/10 md:bg-white flex items-center justify-center gap-3 hover:bg-blue-50"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                                </svg>
                                <span className="font-semibold text-primary">Entrar com Google</span>
                            </Button>
                        */}

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