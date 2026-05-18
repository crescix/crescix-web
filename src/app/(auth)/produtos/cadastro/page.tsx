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
import { createProduto } from "@/services/produtos";
import { extractApiError } from "@/lib/utils/api-errors";

const inputClass =
  "w-full px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/15 transition-all";

const FORM_VAZIO = {
  nome: "",
  sku: "",
  descricao: "",
  preco: "0",
  estoqueMinimo: "0",
};

export default function CadastroProduto() {
  const router = useRouter();
  const [form, setForm] = useState(FORM_VAZIO);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.nome.trim()) {
      setError("Informe o nome do produto.");
      return;
    }

    setSaving(true);
    try {
      await createProduto({
        nome: form.nome.trim(),
        sku: form.sku.trim() || undefined,
        descricao: form.descricao.trim() || undefined,
        preco: parseFloat(form.preco) || 0,
        estoqueMinimo: parseInt(form.estoqueMinimo, 10) || 0,
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
            href="/produtos"
            className="p-2 rounded-lg text-white/50 hover:bg-white/5 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Novo produto
            </h1>
            <p className="text-sm text-white/45 mt-0.5">
              Só o nome é obrigatório. O resto, se você souber, ajuda nos relatórios.
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <section className="bg-primary rounded-2xl border border-white/10 p-5 md:p-6 space-y-5">

            <Field label="Nome" required>
              <input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder='Ex.: "Coca 2L", "Pão francês", "Corte feminino"'
                required
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Preço" hint="Quanto você vende cada unidade.">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.preco}
                    onChange={(e) => setForm({ ...form, preco: e.target.value })}
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </Field>

              <Field
                label="Aviso de baixo estoque"
                hint="Te avisa quando sobrar essa quantidade ou menos."
              >
                <input
                  type="number"
                  min="0"
                  value={form.estoqueMinimo}
                  onChange={(e) => setForm({ ...form, estoqueMinimo: e.target.value })}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Código (opcional)" hint='Seu código interno, se tiver. Ex.: "CX-001"'>
              <input
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="Deixe em branco se não usa código"
                className={inputClass}
              />
            </Field>

            <Field label="Descrição (opcional)">
              <textarea
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                rows={3}
                placeholder="Tamanho, marca, sabor, qualquer detalhe que ajude a identificar..."
                className={`${inputClass} resize-none`}
              />
            </Field>
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
            <Link href="/produtos" className="sm:order-1">
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

      {/* ── Modal de sucesso ───────────────────────────────────────── */}
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
                Produto cadastrado com sucesso.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setSuccess(false);
                  router.push("/produtos");
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
// SUBCOMPONENTE
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
