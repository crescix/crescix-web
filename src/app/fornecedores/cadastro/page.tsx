"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, UserCircle, CreditCard, Save, XCircle, Upload } from "lucide-react";
import { fornecedorSchema, FornecedorFormData } from "@/lib/validations/fornecedor/cadastro";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    // Aqui você faria a chamada para sua API futuramente
  };

  return (
    <main className="min-h-screen w-full bg-secondary p-4 md:p-8 flex justify-center">
      <Card className="w-full max-w-5xl border-none bg-primary text-white shadow-2xl">
        <CardHeader className="border-b border-white/10 pb-6">
          <CardTitle className="text-3xl font-black tracking-tighter flex items-center gap-3">
            <Building2 className="h-8 w-8 text-cyan-400" />
            CADASTRO DE FORNECEDOR
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
            
            {/* SEÇÃO: DADOS DA EMPRESA */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 border-l-4 border-cyan-400 pl-4">
                <h3 className="text-xl font-bold uppercase tracking-widest text-white/90">Dados da Empresa</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label className="text-white/70">Razão Social*</Label>
                  <Input {...register("razaoSocial")} placeholder="Nome oficial da empresa" className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-cyan-400" />
                  {errors.razaoSocial && <p className="text-red-400 text-xs">{errors.razaoSocial.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-1">
                  <Label className="text-white/70">CNPJ*</Label>
                  <Input {...register("cnpj")} placeholder="00.000.000/0000-00" className="bg-white/5 border-white/10 text-white focus:border-cyan-400" />
                  {errors.cnpj && <p className="text-red-400 text-xs">{errors.cnpj.message}</p>}
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label className="text-white/70">Endereço*</Label>
                  <Input {...register("endereco")} placeholder="Rua, Av, Logradouro..." className="bg-white/5 border-white/10 text-white focus:border-cyan-400" />
                  {errors.endereco && <p className="text-red-400 text-xs">{errors.endereco.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70">Ramo de Atividade*</Label>
                  <select {...register("ramoAtividade")} className="w-full h-10 rounded-md bg-white/5 border border-white/10 px-3 text-white focus:outline-none focus:ring-1 focus:ring-cyan-400">
                    <option value="" className="bg-primary">Selecione uma opção</option>
                    <option value="alimentos" className="bg-primary">Alimentos</option>
                    <option value="tecnologia" className="bg-primary">Tecnologia</option>
                    <option value="servicos" className="bg-primary">Serviços</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70">Bairro*</Label>
                  <Input {...register("bairro")} className="bg-white/5 border-white/10 text-white" />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70">Número*</Label>
                  <Input {...register("numero")} className="bg-white/5 border-white/10 text-white" />
                </div>

                {/* Placeholder para o Logo */}
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-4 bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                    <Upload className="h-6 w-6 text-cyan-400 mb-2" />
                    <span className="text-xs font-bold text-white/50 uppercase">Exportar Logo da Empresa</span>
                </div>
              </div>
            </section>

            {/* SEÇÃO: REPRESENTANTE COMERCIAL */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 border-l-4 border-secondary pl-4">
                <h3 className="text-xl font-bold uppercase tracking-widest text-white/90">Dados do Representante Comercial</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label className="text-white/70 italic">Nome do Vendedor*</Label>
                  <Input {...register("nomeVendedor")} className="bg-white/5 border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">WhatsApp do Vendedor*</Label>
                  <Input {...register("whatsappVendedor")} className="bg-white/5 border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">E-mail do Vendedor*</Label>
                  <Input {...register("emailVendedor")} className="bg-white/5 border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Site/Catálogo</Label>
                  <Input {...register("siteCatalogo")} placeholder="https://..." className="bg-white/5 border-white/10 text-white" />
                </div>
              </div>
            </section>

            {/* SEÇÃO: FINANCEIRO */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 border-l-4 border-green-400 pl-4">
                <h3 className="text-xl font-bold uppercase tracking-widest text-white/90">Dados Bancários / Financeiros</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label className="text-white/70">Chave Pix*</Label>
                  <Input {...register("chavePix")} className="bg-white/5 border-white/10 text-white" />
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <Label className="text-white/70">Agência*</Label>
                  <Input {...register("agencia")} className="bg-white/5 border-white/10 text-white" />
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <Label className="text-white/70">Banco*</Label>
                  <Input {...register("banco")} className="bg-white/5 border-white/10 text-white" />
                </div>
                <div className=" space-y-2 lg:col-span-2 ">
                  <Label className="text-white/70">Conta*</Label>
                  <Input {...register("conta")} className="bg-white/5 border-white/10 text-white" />
                </div>
                <div className=" md:col-span-2 space-y-2">
                  <Label className="text-white/70">Condição de Pagamento Padrão*</Label>
                  <Input {...register("condicaoPagamento")} placeholder="Ex: 28 dias, À vista" className="bg-white/5 border-white/10 text-white" />
                </div>
              </div>
            </section>

            {/* BOTÕES DE AÇÃO */}
            <div className="flex flex-col md:flex-row  justify-end items-center gap-4 pt-10 mt-10 border-t border-white/10">
              <Button type="button" variant="outline" className="border-white/10 text-white hover:bg-white/10 rounded-full px-8">
                <XCircle className="mr-2 h-4 w-4" /> Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-secondary hover:bg-secondary/80 text-primary font-bold rounded-full px-12 shadow-lg shadow-secondary/20">
                <Save className="mr-2 h-4 w-4" /> {isSubmitting ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </main>
  );
}