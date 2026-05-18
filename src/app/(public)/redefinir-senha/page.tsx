"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/services/password-reset";
import { extractApiError } from "@/lib/utils/api-errors";
import {
  STORAGE_TOKEN_KEY,
  STORAGE_USER_KEY,
} from "@/services/api/axios-config";

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
    <div className="flex flex-col md:flex-row w-full max-w-[1000px] min-h-[600px] bg-white rounded-none md:rounded-3xl overflow-hidden shadow-2xl">
      <div className="flex flex-1 bg-primary md:p-12 flex-col items-center justify-center text-white relative p-6">
        <h1 className="text-5xl font-black tracking-tighter">
          <span>CRESC</span>
          <span className="text-cyan opacity-80">IX</span>
        </h1>
        <p className="font-medium">Crescendo o seu negócio</p>
        <h2 className="text-3xl md:text-4xl font-bold mt-8 mb-2 text-center">
          Nova senha
        </h2>
        <p className="text-white/70 text-center text-sm max-w-sm">
          Escolha uma senha forte e fácil de lembrar.
        </p>
      </div>

      <div className="flex-[1.2] flex flex-col p-8 md:p-16 bg-gray-100 justify-center">
        <div className="w-full max-w-sm mx-auto space-y-8">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-primary md:text-gray-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar pro login
          </Link>

          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-primary md:text-gray-800">
              Redefinir senha
            </h3>
            <p className="text-sm text-gray-600">
              Crie uma senha com ao menos 8 caracteres.
            </p>
          </div>

          {tokenAusente ? (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold">Link incompleto.</p>
                <p className="mt-1">
                  O link de redefinição parece estar quebrado. Solicite um
                  novo na tela{" "}
                  <Link href="/esqueci-senha" className="font-bold underline">
                    esqueci minha senha
                  </Link>.
                </p>
              </div>
            </div>
          ) : success ? (
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4 text-green-700">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold">Senha redefinida!</p>
                <p className="mt-1 text-green-700/80">
                  Você já está logado. Redirecionando para o painel...
                </p>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="relative">
                <Lock className="absolute left-0 bottom-2 h-5 w-5 text-primary md:text-gray-500" />
                <Input
                  type="password"
                  placeholder="Nova senha (mín. 8 caracteres)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="pl-8 border-t-0 border-x-0 border-b-2 border-primary md:border-gray-300 rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-primary transition-colors text-primary"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-0 bottom-2 h-5 w-5 text-primary md:text-gray-500" />
                <Input
                  type="password"
                  placeholder="Confirme a nova senha"
                  value={confirma}
                  onChange={(e) => setConfirma(e.target.value)}
                  required
                  minLength={8}
                  className="pl-8 border-t-0 border-x-0 border-b-2 border-primary md:border-gray-300 rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-primary transition-colors text-primary"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center font-medium">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading || !password || !confirma}
                className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-full text-lg font-semibold shadow-lg disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Salvando...
                  </span>
                ) : (
                  "Redefinir senha"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-secondary">
          <Loader2 className="h-6 w-6 animate-spin text-green-400" />
        </div>
      }
    >
      <RedefinirSenhaForm />
    </Suspense>
  );
}
