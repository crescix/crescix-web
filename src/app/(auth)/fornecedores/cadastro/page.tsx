"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  User,
  CreditCard,
  Save,
  X,
  Upload,
  ChevronLeft,
} from "lucide-react";
import { fornecedorSchema, FornecedorFormData } from "@/lib/validations/fornecedor/cadastro";
import Link from "next/link";

// ─── Campo reutilizável ───────────────────────────────────────────────────────
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
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-rose-500 mt-1">{error}</p>
      )}
    </div>
  );
}

const inputClass =
  "w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all";

const selectClass =
  "w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer";

// ─── Seção ────────────────────────────────────────────────────────────────────
function Section({
  icon: Icon,
  title,
  accent,
  children,
}: {
  icon: React.ElementType;
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className={`px-6 py-4 border-b border-gray-100 flex items-center gap-3`}>
        <div className={`rounded-xl p-2.5 ${accent}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          {title}
        </h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function CadastroFornecedor() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FornecedorFormData>({
    resolver: zodResolver(fornecedorSchema),
  });

  const onSubmit = async (data: FornecedorFormData) => {
    console.log("Dados do Fornecedor:", data);
    // Chamada para API quando disponível
  };

  return (
    <div className="min-h-screen w-full bg-transparent py-4">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-6">

        {/* Cabeçalho */}
        <div className="flex items-center gap-4">
          <Link
            href="/fornecedores"
            className="p-2 rounded-xl text-blak hover:bg-white hover:text-gray-600 border border-transparent hover:border-gray-200 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
              Cadastro de Fornecedor
            </h1>
            <p className="text-lg text-gray-800 mt-0.5">
              Preencha os dados do novo parceiro
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* DADOS DA EMPRESA */}
          <Section
            icon={Building2}
            title="Dados da Empresa"
            accent="bg-teal-50 text-teal-600"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

              <Field label="Razão Social" required error={errors.razaoSocial?.message} className="md:col-span-2">
                <input
                  {...register("razaoSocial")}
                  placeholder="Nome oficial da empresa"
                  className={inputClass}
                />
              </Field>

              <Field label="CNPJ" required error={errors.cnpj?.message}>
                <input
                  {...register("cnpj")}
                  placeholder="00.000.000/0000-00"
                  className={inputClass}
                />
              </Field>

              <Field label="Ramo de Atividade" required error={errors.ramoAtividade?.message}>
                <select {...register("ramoAtividade")} className={selectClass}>
                  <option value="">Selecione...</option>
                  <option value="alimentos">Alimentos</option>
                  <option value="tecnologia">Tecnologia</option>
                  <option value="servicos">Serviços</option>
                  <option value="industria">Indústria</option>
                  <option value="comercio">Comércio</option>
                </select>
              </Field>

              <Field label="Endereço" required error={errors.endereco?.message} className="md:col-span-2">
                <input
                  {...register("endereco")}
                  placeholder="Rua, Av, Logradouro..."
                  className={inputClass}
                />
              </Field>

              <Field label="Bairro" required error={errors.bairro?.message}>
                <input {...register("bairro")} className={inputClass} />
              </Field>

              <Field label="Número" required error={errors.numero?.message}>
                <input {...register("numero")} className={inputClass} />
              </Field>

              {/* Upload de logo */}
              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Logo da Empresa
                </label>
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 hover:bg-teal-50 hover:border-teal-300 transition-all cursor-pointer group">
                  <Upload className="w-5 h-5 text-gray-400 group-hover:text-teal-500 transition-colors" />
                  <span className="text-xs text-gray-400 group-hover:text-teal-600 transition-colors font-medium">
                    Clique para fazer upload da logo
                  </span>
                  <span className="text-xs text-gray-300">PNG, JPG até 2MB</span>
                  <input type="file" accept="image/*" className="hidden" />
                </label>
              </div>

            </div>
          </Section>

          {/* REPRESENTANTE COMERCIAL */}
          <Section
            icon={User}
            title="Representante Comercial"
            accent="bg-blue-50 text-blue-600"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

              <Field label="Nome do Vendedor" required error={errors.nomeVendedor?.message}>
                <input {...register("nomeVendedor")} className={inputClass} />
              </Field>

              <Field label="WhatsApp" required error={errors.whatsappVendedor?.message}>
                <input
                  {...register("whatsappVendedor")}
                  placeholder="(00) 00000-0000"
                  className={inputClass}
                />
              </Field>

              <Field label="E-mail" required error={errors.emailVendedor?.message}>
                <input
                  {...register("emailVendedor")}
                  type="email"
                  placeholder="email@empresa.com"
                  className={inputClass}
                />
              </Field>

              <Field label="Site / Catálogo" error={errors.siteCatalogo?.message}>
                <input
                  {...register("siteCatalogo")}
                  placeholder="https://..."
                  className={inputClass}
                />
              </Field>

            </div>
          </Section>

          {/* DADOS BANCÁRIOS */}
          <Section
            icon={CreditCard}
            title="Dados Bancários / Financeiros"
            accent="bg-emerald-50 text-emerald-600"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

              <Field label="Chave Pix" required error={errors.chavePix?.message} className="md:col-span-2">
                <input {...register("chavePix")} className={inputClass} />
              </Field>

              <Field label="Banco" required error={errors.banco?.message}>
                <input {...register("banco")} className={inputClass} />
              </Field>

              <Field label="Agência" required error={errors.agencia?.message}>
                <input {...register("agencia")} className={inputClass} />
              </Field>

              <Field label="Conta" required error={errors.conta?.message}>
                <input {...register("conta")} className={inputClass} />
              </Field>

              <Field
                label="Condição de Pagamento"
                required
                error={errors.condicaoPagamento?.message}
                className="md:col-span-3"
              >
                <input
                  {...register("condicaoPagamento")}
                  placeholder="Ex: 28 dias, À vista, 30/60/90..."
                  className={inputClass}
                />
              </Field>

            </div>
          </Section>

          {/* BOTÕES */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <Link href="/fornecedores">
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-red-500 text-sm font-medium text-black bg-white hover:bg-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-medium shadow-sm transition-colors disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? "Cadastrando..." : "Cadastrar Fornecedor"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
