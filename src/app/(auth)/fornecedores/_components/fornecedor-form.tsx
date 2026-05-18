"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  ChevronLeft,
  Save,
  X,
  ChevronDown,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fornecedorSchema,
  type FornecedorFormData,
} from "@/lib/validations/fornecedor/cadastro";
import { maskCNPJ, maskPhone } from "@/lib/utils/masks";

/**
 * Formulário compartilhado de Fornecedor — usado pelo cadastro e pela edição.
 *
 * Reduzido aos 4 campos que a API exige (nome da empresa, CNPJ, endereço,
 * tipo); o resto fica em "Mais detalhes" colapsável. O dono de um pequeno
 * negócio consegue cadastrar um fornecedor em <30s, sem precisar saber
 * banco/agência/conta do cara antes.
 *
 * Linguagem: trocada do "dev" pro "dono de negócio".
 *   Razão Social        → Nome da empresa
 *   Ramo de Atividade   → O que ela vende
 *   Nome do Vendedor    → Quem te atende lá
 *   Condição Pagamento  → Prazo pra pagar
 */

interface FornecedorFormProps {
  /** Valores iniciais — pra edição vem preenchido, pra cadastro fica vazio. */
  defaultValues?: Partial<FornecedorFormData>;
  /** Texto do botão de submit. Default: "Salvar". */
  submitLabel?: string;
  /** Texto durante o submit. Default: "Salvando...". */
  submittingLabel?: string;
  /** Chamado após submit válido. Retorna void; quem chama mostra feedback. */
  onSubmit: (data: FornecedorFormData) => Promise<void>;
  /** Mensagem de erro vinda do servidor pra mostrar no topo do form. */
  submitError?: string | null;
  /** Callback pra fechar/limpar o erro. */
  onClearSubmitError?: () => void;
  /** Título grande do header. */
  titulo: string;
  /** Subtítulo cinza embaixo do título. */
  subtitulo?: string;
}

const inputClass =
  "w-full px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/15 transition-all";

export function FornecedorForm({
  defaultValues,
  submitLabel = "Salvar",
  submittingLabel = "Salvando...",
  onSubmit,
  submitError,
  onClearSubmitError,
  titulo,
  subtitulo,
}: FornecedorFormProps) {
  const [maisDetalhes, setMaisDetalhes] = useState(
    // Em modo edição, expande se o fornecedor já tem algum dado opcional
    // preenchido — pra não esconder informação.
    () => Boolean(temAlgumOpcional(defaultValues)),
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FornecedorFormData>({
    resolver: zodResolver(fornecedorSchema),
    defaultValues: {
      type: undefined,
      ...defaultValues,
    },
  });

  const cnpj = watch("cnpj") ?? "";
  const whatsapp = watch("whatsappVendedor") ?? "";
  const tipoSel = watch("type");

  return (
    <div className="w-full min-h-screen bg-secondary p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-6">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <header className="flex items-center gap-3">
          <Link
            href="/fornecedores"
            className="p-2 rounded-lg text-white/50 hover:bg-white/5 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {titulo}
            </h1>
            {subtitulo && (
              <p className="text-sm text-white/45 mt-0.5">{subtitulo}</p>
            )}
          </div>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* ── Bloco principal: sempre visível ────────────────────── */}
          <section className="bg-primary rounded-2xl border border-white/10 p-5 md:p-6 space-y-5">

            <Field label="Nome da empresa" required error={errors.razaoSocial?.message}>
              <input
                {...register("razaoSocial")}
                placeholder='Ex.: "Distribuidora Sol Ltda"'
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="CNPJ" required error={errors.cnpj?.message}>
                <input
                  value={cnpj}
                  onChange={(e) =>
                    setValue("cnpj", maskCNPJ(e.target.value), {
                      shouldValidate: false,
                    })
                  }
                  placeholder="00.000.000/0000-00"
                  inputMode="numeric"
                  className={inputClass}
                />
              </Field>

              <Field label="Tipo de fornecedor" required error={errors.type?.message}>
                <TipoPills
                  valor={tipoSel}
                  onChange={(v) =>
                    setValue("type", v, { shouldValidate: true })
                  }
                />
              </Field>
            </div>

            <Field label="Endereço" required error={errors.endereco?.message}>
              <input
                {...register("endereco")}
                placeholder="Rua, número, bairro, cidade..."
                className={inputClass}
              />
              <p className="text-xs text-white/35 mt-1.5">
                Pode escrever tudo numa linha só. Se quiser separar bairro e número, use os campos lá embaixo.
              </p>
            </Field>
          </section>

          {/* ── Mais detalhes — colapsável ─────────────────────────── */}
          <section className="bg-primary rounded-2xl border border-white/10 overflow-hidden">
            <button
              type="button"
              onClick={() => setMaisDetalhes((v) => !v)}
              className="w-full flex items-center justify-between px-5 md:px-6 py-4 hover:bg-white/[0.03] transition-colors text-left"
            >
              <div>
                <p className="text-sm font-semibold text-white">
                  Mais detalhes
                </p>
                <p className="text-xs text-white/45 mt-0.5">
                  Contato, prazo de pagamento, dados bancários — tudo opcional.
                </p>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-white/40 transition-transform duration-200 ${
                  maisDetalhes ? "rotate-180" : ""
                }`}
              />
            </button>

            {maisDetalhes && (
              <div className="border-t border-white/10 p-5 md:p-6 space-y-6">

                {/* ─ Contato ─────────────────────────────────────────── */}
                <Bloco titulo="Quem você fala lá">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Nome do contato" error={errors.nomeVendedor?.message}>
                      <input
                        {...register("nomeVendedor")}
                        placeholder='Ex.: "João do depósito"'
                        className={inputClass}
                      />
                    </Field>
                    <Field label="WhatsApp" error={errors.whatsappVendedor?.message}>
                      <input
                        value={whatsapp}
                        onChange={(e) =>
                          setValue(
                            "whatsappVendedor",
                            maskPhone(e.target.value),
                            { shouldValidate: false },
                          )
                        }
                        placeholder="(00) 00000-0000"
                        inputMode="numeric"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="E-mail" error={errors.emailVendedor?.message}>
                      <input
                        {...register("emailVendedor")}
                        type="email"
                        placeholder="contato@empresa.com"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Site ou catálogo" error={errors.siteCatalogo?.message}>
                      <input
                        {...register("siteCatalogo")}
                        placeholder="www.empresa.com.br"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </Bloco>

                {/* ─ O que ela vende ──────────────────────────────────── */}
                <Bloco titulo="O que ela vende">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Ramo" error={errors.ramoAtividade?.message}>
                      <input
                        {...register("ramoAtividade")}
                        placeholder='Ex.: "Bebidas", "Hortifruti"'
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Prazo pra pagar" error={errors.condicaoPagamento?.message}>
                      <input
                        {...register("condicaoPagamento")}
                        placeholder='Ex.: "30 dias", "À vista"'
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </Bloco>

                {/* ─ Endereço separado ────────────────────────────────── */}
                <Bloco titulo="Endereço separado">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <Field label="Bairro" error={errors.bairro?.message} className="md:col-span-2">
                      <input {...register("bairro")} className={inputClass} />
                    </Field>
                    <Field label="Número" error={errors.numero?.message}>
                      <input {...register("numero")} className={inputClass} />
                    </Field>
                  </div>
                </Bloco>

                {/* ─ Como você paga ──────────────────────────────────── */}
                <Bloco titulo="Como você paga ele">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Chave Pix" error={errors.chavePix?.message} className="md:col-span-2">
                      <input
                        {...register("chavePix")}
                        placeholder="CNPJ, telefone, e-mail ou chave aleatória"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Banco" error={errors.banco?.message}>
                      <input {...register("banco")} className={inputClass} />
                    </Field>
                    <Field label="Agência" error={errors.agencia?.message}>
                      <input {...register("agencia")} className={inputClass} />
                    </Field>
                    <Field label="Conta" error={errors.conta?.message} className="md:col-span-2">
                      <input {...register("conta")} className={inputClass} />
                    </Field>
                  </div>
                </Bloco>
              </div>
            )}
          </section>

          {/* ── Erro de submit ─────────────────────────────────────── */}
          {submitError && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-400/30 rounded-xl p-4">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="flex-1 text-red-300 text-sm">{submitError}</p>
              {onClearSubmitError && (
                <button
                  type="button"
                  onClick={onClearSubmitError}
                  className="text-red-400/60 hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* ── Botões ─────────────────────────────────────────────── */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-1">
            <Link href="/fornecedores" className="sm:order-1">
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
              disabled={isSubmitting}
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
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {submittingLabel}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {submitLabel}
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBCOMPONENTES
// ─────────────────────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  error,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-xs font-semibold text-white/55 uppercase tracking-wider">
        {label}
        {required && <span className="text-brand ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-widest text-white/40 font-semibold mb-3">
        {titulo}
      </p>
      {children}
    </div>
  );
}

/**
 * Pills clicáveis pra selecionar tipo do fornecedor. Mais intuitivo que
 * dropdown quando há 3 opções fixas — o usuário vê tudo de uma vez.
 */
function TipoPills({
  valor,
  onChange,
}: {
  valor: "COMERCIO" | "INDUSTRIA" | "SERVICO" | undefined;
  onChange: (v: "COMERCIO" | "INDUSTRIA" | "SERVICO") => void;
}) {
  const opts: Array<{ id: "COMERCIO" | "INDUSTRIA" | "SERVICO"; label: string }> = [
    { id: "COMERCIO", label: "Comércio" },
    { id: "INDUSTRIA", label: "Indústria" },
    { id: "SERVICO", label: "Serviço" },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {opts.map((opt) => {
        const ativo = valor === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
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
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Helper: detecta se algum campo opcional já tem valor. Usado pelo modo
 * edição pra abrir a seção "Mais detalhes" automaticamente quando há
 * dados pra mostrar.
 */
function temAlgumOpcional(v: Partial<FornecedorFormData> | undefined): boolean {
  if (!v) return false;
  const opcionais: (keyof FornecedorFormData)[] = [
    "bairro", "numero", "ramoAtividade",
    "nomeVendedor", "whatsappVendedor", "emailVendedor", "siteCatalogo",
    "chavePix", "banco", "agencia", "conta", "condicaoPagamento",
  ];
  return opcionais.some((k) => Boolean(v[k]));
}
