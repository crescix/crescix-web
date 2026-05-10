"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, User, CreditCard, Save, X, Upload, ChevronLeft, CheckCircle2 } from "lucide-react";
import { fornecedorSchema, FornecedorFormData } from "@/lib/validations/fornecedor/cadastro";
import Link from "next/link";
import { useState } from "react";

function Field({ label, required, error, children, className = "" }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

const inputClass = "w-full px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-cyan-500/50 transition-all";
const selectClass = "w-full px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition-all cursor-pointer";

function Section({ icon: Icon, title, number, children }: {
  icon: React.ElementType; title: string; number: number; children: React.ReactNode;
}) {
  return (
    <div className="bg-primary rounded-2xl border border-white/10 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">
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

export default function CadastroFornecedor() {
  const [modal, setModal] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FornecedorFormData>({
    resolver: zodResolver(fornecedorSchema),
  });

  const onSubmit = async (data: FornecedorFormData) => {
    console.log("Dados do Fornecedor:", data);
    setModal(true);
  };

  return (
    <div className="w-full min-h-screen bg-secondary p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/fornecedores" className="p-2 rounded-xl text-white/50 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-1">
              Cadastros / Fornecedores
            </p>
            <h1 className="text-3xl font-black text-white tracking-tighter">
              Cadastro de Fornecedor
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* DADOS DA EMPRESA */}
          <Section icon={Building2} title="Dados da Empresa" number={1}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

              <Field label="Razão Social" required error={errors.razaoSocial?.message} className="md:col-span-2">
                <input {...register("razaoSocial")} placeholder="Nome oficial da empresa" className={inputClass} />
              </Field>

              <Field label="CNPJ" required error={errors.cnpj?.message}>
                <input {...register("cnpj")} placeholder="00.000.000/0000-00" className={inputClass} />
              </Field>

              <Field label="Ramo de Atividade" required error={errors.ramoAtividade?.message}>
                <select {...register("ramoAtividade")} className={selectClass}>
                  <option value="" className="bg-[#0f2f52]">Selecione...</option>
                  <option value="alimentos" className="bg-[#0f2f52]">Alimentos</option>
                  <option value="tecnologia" className="bg-[#0f2f52]">Tecnologia</option>
                  <option value="servicos" className="bg-[#0f2f52]">Serviços</option>
                  <option value="industria" className="bg-[#0f2f52]">Indústria</option>
                  <option value="comercio" className="bg-[#0f2f52]">Comércio</option>
                </select>
              </Field>

              <Field label="Endereço" required error={errors.endereco?.message} className="md:col-span-2">
                <input {...register("endereco")} placeholder="Rua, Av, Logradouro..." className={inputClass} />
              </Field>

              <Field label="Bairro" required error={errors.bairro?.message}>
                <input {...register("bairro")} className={inputClass} />
              </Field>

              <Field label="Número" required error={errors.numero?.message}>
                <input {...register("numero")} className={inputClass} />
              </Field>

              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1.5">
                  Logo da Empresa
                </label>
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-white/10 rounded-xl p-6 bg-white/5 hover:bg-cyan-500/5 hover:border-cyan-500/30 transition-all cursor-pointer group">
                  <Upload className="w-5 h-5 text-white/20 group-hover:text-cyan-400 transition-colors" />
                  <span className="text-xs text-white/30 group-hover:text-cyan-400 transition-colors font-medium">
                    Clique para fazer upload da logo
                  </span>
                  <span className="text-xs text-white/20">PNG, JPG até 2MB</span>
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
                <input {...register("whatsappVendedor")} placeholder="(00) 00000-0000" className={inputClass} />
              </Field>

              <Field label="E-mail" required error={errors.emailVendedor?.message}>
                <input {...register("emailVendedor")} type="email" placeholder="email@empresa.com" className={inputClass} />
              </Field>

              <Field label="Site / Catálogo" error={errors.siteCatalogo?.message}>
                <input {...register("siteCatalogo")} placeholder="https://..." className={inputClass} />
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

              <Field label="Condição de Pagamento" required error={errors.condicaoPagamento?.message} className="md:col-span-3">
                <input {...register("condicaoPagamento")} placeholder="Ex: 28 dias, À vista, 30/60/90..." className={inputClass} />
              </Field>

            </div>
          </Section>

          {/* BOTÕES */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <Link href="/fornecedores">
              <button type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 text-sm font-semibold transition-all active:scale-95">
                <X className="w-4 h-4" /> Cancelar
              </button>
            </Link>
            <button type="submit" disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-60">
              <Save className="w-4 h-4" />
              {isSubmitting ? "Cadastrando..." : "Cadastrar Fornecedor"}
            </button>
          </div>

        </form>
      </div>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-primary w-full max-w-sm rounded-2xl border border-white/10 p-6 space-y-4 text-center">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-400" />
              </div>
            </div>
            <h2 className="text-white font-bold text-lg">Fornecedor cadastrado com sucesso!</h2>
            <button onClick={() => setModal(false)}
              className="w-full h-10 rounded-xl bg-green-500 hover:bg-green-400 text-white text-sm font-bold transition-all active:scale-95">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}