"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createCliente } from "@/services/clientes";
import { maskCPF, maskPhone } from "@/lib/utils/masks";
import { extractApiError } from "@/lib/utils/api-errors";

const inputClass =
  "w-full px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/15 transition-all";

const FORM_VAZIO = {
  nome: "",
  cpf: "",
  telefone: "",
  email: "",
  saldo: "0",
  status: "ATIVO" as "ATIVO" | "INATIVO",
};

export default function CadastroCliente() {
  const router = useRouter();
  const [form, setForm] = useState(FORM_VAZIO);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.nome.trim()) {
      setError("Informe o nome do cliente.");
      return;
    }

    setSaving(true);
    try {
      await createCliente({
        nome: form.nome.trim(),
        cpf: form.cpf.trim() || undefined,
        telefone: form.telefone.trim() || undefined,
        email: form.email.trim() || undefined,
        saldo: parseFloat(form.saldo) || 0,
        status: form.status,
      });
      setSuccess(true);
    } catch (err) {
      setError(extractApiError(err, "Não consegui cadastrar agora. Tente novamente."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full min-h-screen bg-secondary p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-6">

        {/* ── Header ───────────────────────────────────────────────── */}
        <header className="flex items-center gap-3">
          <Link
            href="/clientes"
            className="p-2 rounded-lg text-white/50 hover:bg-white/5 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Novo cliente
            </h1>
            <p className="text-sm text-white/45 mt-0.5">
              Só o nome é obrigatório. CPF e contato você preenche se quiser.
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <section className="bg-primary rounded-2xl border border-white/10 p-5 md:p-6 space-y-5">

            <Field label="Nome" required>
              <input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder='Ex.: "Maria da padaria", "João da esquina"'
                required
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="CPF (opcional)">
                <input
                  value={form.cpf}
                  onChange={(e) => setForm({ ...form, cpf: maskCPF(e.target.value) })}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  className={inputClass}
                />
              </Field>
              <Field label="Telefone (opcional)">
                <input
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: maskPhone(e.target.value) })}
                  placeholder="(00) 00000-0000"
                  inputMode="numeric"
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="E-mail (opcional)">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@dominio.com"
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Saldo inicial" hint="Se já te deve algo, anota aqui. Senão, deixe zero.">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.saldo}
                    onChange={(e) => setForm({ ...form, saldo: e.target.value })}
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </Field>

              <Field label="Situação">
                <SituacaoPills
                  valor={form.status}
                  onChange={(v) => setForm({ ...form, status: v })}
                />
              </Field>
            </div>
          </section>

          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-400/30 rounded-xl p-4">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="flex-1 text-red-300 text-sm">{error}</p>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-400/60 hover:text-red-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-1">
            <Link href="/clientes" className="sm:order-1">
              <Button
                type="button"
                variant="ghost"
                className="w-full sm:w-auto border border-white/10 text-white/70 hover:bg-white/5"
              >
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={saving}
              className="
                w-full sm:w-auto sm:order-2
                bg-brand hover:bg-brand-strong
                text-white font-semibold
                px-6
                glow-brand glow-brand-hover
                transition-base
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cadastrando...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Cadastrar
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>

      {success && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-primary w-full max-w-sm rounded-2xl border border-white/10 p-6 space-y-4 text-center">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-brand/15 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-brand" />
              </div>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Pronto!</h2>
              <p className="text-sm text-white/55 mt-1">
                Cliente cadastrado com sucesso.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setSuccess(false);
                  router.push("/clientes");
                }}
                className="w-full h-10 rounded-lg bg-brand hover:bg-brand-strong text-white text-sm font-semibold transition-colors"
              >
                Ver lista
              </button>
              <button
                onClick={() => {
                  setForm(FORM_VAZIO);
                  setSuccess(false);
                }}
                className="w-full h-10 rounded-lg border border-white/10 text-white/70 text-sm font-medium hover:bg-white/5 transition-colors"
              >
                Cadastrar outro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBCOMPONENTES
// ─────────────────────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-white/55 uppercase tracking-wider">
        {label}
        {required && <span className="text-brand ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-white/35 mt-1">{hint}</p>}
    </div>
  );
}

function SituacaoPills({
  valor,
  onChange,
}: {
  valor: "ATIVO" | "INATIVO";
  onChange: (v: "ATIVO" | "INATIVO") => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {(["ATIVO", "INATIVO"] as const).map((id) => {
        const ativo = valor === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`
              h-10 px-3
              rounded-lg
              text-sm font-medium
              border transition-colors
              ${ativo
                ? "bg-brand/15 border-brand/50 text-white"
                : "bg-white/5 border-white/10 text-white/65 hover:bg-white/8 hover:border-white/20"
              }
            `}
          >
            {id === "ATIVO" ? "Ativo" : "Inativo"}
          </button>
        );
      })}
    </div>
  );
}
