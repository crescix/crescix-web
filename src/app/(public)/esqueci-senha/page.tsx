"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPassword } from "@/services/password-reset";
import { extractApiError } from "@/lib/utils/api-errors";

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
      setError(extractApiError(err, "Erro ao processar a solicitação."));
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
          Recuperar acesso
        </h2>
        <p className="text-white/70 text-center text-sm max-w-sm">
          Vamos enviar um link de redefinição para o seu e-mail.
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
              Esqueci minha senha
            </h3>
            <p className="text-sm text-gray-600">
              Informe o e-mail cadastrado e enviaremos um link para criar uma
              nova senha.
            </p>
          </div>

          {sent ? (
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4 text-green-700">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold">Verifique seu e-mail.</p>
                <p className="mt-1 text-green-700/80">
                  Se <span className="font-medium">{email}</span> estiver
                  cadastrado, você receberá um link de redefinição em
                  instantes. O link expira em 30 minutos.
                </p>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="relative">
                <Mail className="absolute left-0 bottom-2 h-5 w-5 text-primary md:text-gray-500" />
                <Input
                  type="email"
                  placeholder="Seu e-mail cadastrado"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
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
                disabled={loading || !email}
                className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-full text-lg font-semibold shadow-lg disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Enviando...
                  </span>
                ) : (
                  "Enviar link"
                )}
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-primary md:text-gray-600">
            Lembrou a senha?{" "}
            <Link href="/login" className="font-bold underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
