"use client";

import { createPortal } from "react-dom";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ContaReceber,
  StatusContaReceber,
  CATEGORIAS_RECEBER,
  FORMAS_PAGAMENTO,
} from "@/lib/data/financeiro";
import { clientesMock } from "@/lib/data/orcamentos";

const schema = z.object({
  descricao: z.string().min(3, "Descrição obrigatória (mín. 3 caracteres)"),
  categoria: z.enum(CATEGORIAS_RECEBER as unknown as [string, ...string[]]),
  cliente: z.string().optional(),
  valor: z.number({ message: "Valor obrigatório" }).positive("Valor deve ser maior que zero"),
  vencimento: z.string().min(1, "Vencimento obrigatório"),
  status: z.enum(["Pendente", "Recebido", "Atrasado", "Cancelado"]),
  data_recebimento: z.string().optional(),
  forma_pagamento: z.string().optional(),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ContaReceberFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (conta: ContaReceber) => void;
  conta: ContaReceber | null;
}

const fieldLabel = "text-white/60 text-xs font-bold uppercase tracking-wider block mb-1.5";
const fieldInput = "bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-green-500/50 h-9 text-sm";
const fieldSelect = "w-full bg-white/5 border border-white/10 text-white focus:border-green-500/50 h-9 px-3 rounded-md focus:outline-none text-sm";
const fieldError = "text-red-400 text-xs mt-1";

export function ContaReceberForm({ isOpen, onOpenChange, onSubmit, conta }: ContaReceberFormProps) {
  const isEdit = conta !== null;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      descricao: "",
      categoria: "Venda",
      cliente: "",
      valor: 0,
      vencimento: "",
      status: "Pendente",
      data_recebimento: "",
      forma_pagamento: "",
      observacoes: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        descricao: conta?.descricao ?? "",
        categoria: conta?.categoria ?? "Venda",
        cliente: conta?.cliente ?? "",
        valor: conta?.valor ?? 0,
        vencimento: conta?.vencimento ?? "",
        status: conta?.status ?? "Pendente",
        data_recebimento: conta?.data_recebimento ?? "",
        forma_pagamento: conta?.forma_pagamento ?? "",
        observacoes: conta?.observacoes ?? "",
      });
    }
  }, [isOpen, conta, reset]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onOpenChange]);

  const status = watch("status");
  const showDataRecebimento = status === "Recebido";

  const submit = (data: FormData) => {
    const novaConta: ContaReceber = {
      id: conta?.id ?? `cr-${Date.now()}`,
      descricao: data.descricao,
      categoria: data.categoria as ContaReceber["categoria"],
      cliente: data.cliente || undefined,
      valor: data.valor,
      vencimento: data.vencimento,
      status: data.status as StatusContaReceber,
      data_recebimento: data.status === "Recebido"
        ? (data.data_recebimento || new Date().toISOString().slice(0, 10))
        : undefined,
      forma_pagamento: data.forma_pagamento
        ? (data.forma_pagamento as ContaReceber["forma_pagamento"])
        : undefined,
      observacoes: data.observacoes || undefined,
    };
    onSubmit(novaConta);
    onOpenChange(false);
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto"
      onClick={() => onOpenChange(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-primary border border-white/10 text-white rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden my-8"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold">
              {isEdit ? "Editar Conta a Receber" : "Nova Conta a Receber"}
            </h2>
            <p className="text-white/60 text-sm mt-1">
              Preencha os dados da conta.
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className={fieldLabel}>Descrição *</label>
              <Input
                {...register("descricao")}
                placeholder="Ex.: Venda Pedido #1254, Serviço de instalação..."
                className={fieldInput}
              />
              {errors.descricao && <p className={fieldError}>{errors.descricao.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={fieldLabel}>Categoria *</label>
                <select {...register("categoria")} className={fieldSelect}>
                  {CATEGORIAS_RECEBER.map((c) => (
                    <option key={c} value={c} className="bg-primary">{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={fieldLabel}>Cliente</label>
                <input
                  {...register("cliente")}
                  list="clientes-list"
                  placeholder="Selecione ou digite"
                  className={`${fieldInput} px-3`}
                />
                <datalist id="clientes-list">
                  {clientesMock.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={fieldLabel}>Valor (R$) *</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  className={fieldInput}
                  {...register("valor", { valueAsNumber: true })}
                />
                {errors.valor && <p className={fieldError}>{errors.valor.message}</p>}
              </div>

              <div>
                <label className={fieldLabel}>Vencimento *</label>
                <Input type="date" {...register("vencimento")} className={fieldInput} />
                {errors.vencimento && <p className={fieldError}>{errors.vencimento.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={fieldLabel}>Status *</label>
                <select {...register("status")} className={fieldSelect}>
                  <option value="Pendente" className="bg-primary">Pendente</option>
                  <option value="Recebido" className="bg-primary">Recebido</option>
                  <option value="Atrasado" className="bg-primary">Atrasado</option>
                  <option value="Cancelado" className="bg-primary">Cancelado</option>
                </select>
              </div>

              <div>
                <label className={fieldLabel}>Forma de Recebimento</label>
                <select {...register("forma_pagamento")} className={fieldSelect}>
                  <option value="" className="bg-primary">—</option>
                  {FORMAS_PAGAMENTO.map((f) => (
                    <option key={f} value={f} className="bg-primary">{f}</option>
                  ))}
                </select>
              </div>
            </div>

            {showDataRecebimento && (
              <div>
                <label className={fieldLabel}>Data do Recebimento</label>
                <Input type="date" {...register("data_recebimento")} className={fieldInput} />
                <p className="text-white/30 text-xs mt-1">
                  Se vazio, será preenchido com a data de hoje.
                </p>
              </div>
            )}

            <div>
              <label className={fieldLabel}>Observações</label>
              <textarea
                {...register("observacoes")}
                rows={3}
                placeholder="Anotações internas..."
                className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:border-green-500/50 px-3 py-2 rounded-md focus:outline-none text-sm resize-none"
              />
            </div>
          </div>

          <div className="border-t border-white/10 bg-white/5 px-6 py-5 flex gap-3 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="border border-white/10 text-white hover:bg-white/10"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-green-500 hover:bg-green-400 text-white font-bold"
            >
              <Save className="mr-2 h-4 w-4" />
              {isEdit ? "Salvar Alterações" : "Criar Conta"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
