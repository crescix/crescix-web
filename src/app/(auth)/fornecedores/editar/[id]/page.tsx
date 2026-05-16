"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import {
  Building2, User, CreditCard, Save, X, Upload, ChevronLeft,
} from "lucide-react";
import { fornecedorSchema, FornecedorFormData } from "@/lib/validations/fornecedor/cadastro";
import { fornecedoresData } from "@/lib/data/fornecedores";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// ─── Campo reutilizável ───────────────────────────────────────────────────────
function Field({
  label, required, error, children, className = "",
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-xs font-bold text-white/50 uppercase tracking-wider">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

const inputClass =
  "w-full px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/25 focus:outline-none focus:border-green-500/50 transition-colors";

const selectClass =
  "w-full px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500/50 transition-colors cursor-pointer";

// ─── Seção ────────────────────────────────────────────────────────────────────
function Section({
  icon: Icon, title, number, children,
}: {
  icon: React.ElementType;
  title: string;
  number: number;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-primary rounded-2xl border border-white/10 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs font-bold flex items-center justify-center">
          {number}
        </span>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-white/50" />
          <h3 className="text-sm font-bold text-white">{title}</h3>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function EditarFornecedor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const fornecedor = fornecedoresData.find((f) => f.id === id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FornecedorFormData>({
    resolver: zodResolver(fornecedorSchema),
  });

  useEffect(() => {
    if (fornecedor) {
      reset({
        razaoSocial:       fornecedor.razaoSocial       ?? "",
        cnpj:              fornecedor.cnpj              ?? "",
        endereco:          fornecedor.endereco          ?? "",
        bairro:            fornecedor.bairro            ?? "",
        numero:            fornecedor.numero            ?? "",
        ramoAtividade:     fornecedor.ramoAtividade     ?? "",
        nomeVendedor:      fornecedor.nomeVendedor      ?? "",
        whatsappVendedor:  fornecedor.whatsappVendedor  ?? "",
        emailVendedor:     fornecedor.emailVendedor     ?? "",
        siteCatalogo:      fornecedor.siteCatalogo      ?? "",
        chavePix:          fornecedor.chavePix          ?? "",
        banco:             fornecedor.banco             ?? "",
        agencia:           fornecedor.agencia           ?? "",
        conta:             fornecedor.conta             ?? "",
        condicaoPagamento: fornecedor.condicaoPagamento ?? "",
      });
    }
  }, [fornecedor, reset]);

  // Fornecedor não encontrado
  if (!fornecedor) {
    return (
      <div className="w-full min-h-screen bg-secondary flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="bg-red-500/10 rounded-2xl p-6 inline-block">
            <Building2 className="w-8 h-8 text-red-400 mx-auto" />
          </div>
          <p className="text-white/80 font-medium">Fornecedor não encontrado.</p>
          <Link
            href="/fornecedores"
            className="inline-flex items-center gap-2 text-green-400 hover:underline text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar para fornecedores
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: FornecedorFormData) => {
    console.log("Dados atualizados:", data);
    // Chamada para API quando disponível: await api.put(`/fornecedores/${id}`, data)
    router.push("/fornecedores");
  };

  return (
    <div className="w-full min-h-screen bg-secondary p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-6">

        {/* Cabeçalho */}
        <div className="flex items-center gap-4">
          <Link
            href="/fornecedores"
            className="p-2 rounded-xl text-white/50 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">
              Cadastros / Fornecedores
            </p>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-white tracking-tighter">
                Editar Fornecedor
              </h1>
              {isDirty && (
                <span className="text-xs bg-amber-500/15 text-amber-400 border border-amber-500/25 font-medium px-2.5 py-1 rounded-full">
                  Alterações não salvas
                </span>
              )}
            </div>
            <p className="text-sm text-white/40 mt-1">
              {fornecedor.razaoSocial}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* DADOS DA EMPRESA */}
          <Section icon={Building2} title="Dados da Empresa" number={1}>
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
                  <option value="" className="bg-primary">Selecione...</option>
                  <option value="alimentos" className="bg-primary">Alimentos</option>
                  <option value="tecnologia" className="bg-primary">Tecnologia</option>
                  <option value="servicos" className="bg-primary">Serviços</option>
                  <option value="industria" className="bg-primary">Indústria</option>
                  <option value="comercio" className="bg-primary">Comércio</option>
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
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">
                  Logo da Empresa
                </label>
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-white/10 rounded-xl p-6 bg-white/5 hover:bg-green-500/5 hover:border-green-500/30 transition-all cursor-pointer group">
                  <Upload className="w-5 h-5 text-white/40 group-hover:text-green-400 transition-colors" />
                  <span className="text-xs text-white/50 group-hover:text-green-400 transition-colors font-medium">
                    Clique para atualizar a logo
                  </span>
                  <span className="text-xs text-white/30">PNG, JPG até 2MB</span>
                  <input type="file" accept="image/*" className="hidden" />
                </label>
              </div>

            </div>
          </Section>

          {/* REPRESENTANTE COMERCIAL */}
          <Section icon={User} title="Representante Comercial" number={2}>
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
          <Section icon={CreditCard} title="Dados Bancários / Financeiros" number={3}>
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
              <Button
                type="button"
                variant="ghost"
                className="w-full sm:w-auto border border-white/10 text-white hover:bg-white/10"
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="w-full sm:w-auto bg-green-500 hover:bg-green-400 text-white font-bold rounded-full px-6 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
