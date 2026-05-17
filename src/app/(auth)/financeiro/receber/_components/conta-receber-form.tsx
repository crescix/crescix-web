"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { X, Save, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ContaReceber,
  CATEGORIA_RECEBER_LABEL,
  CATEGORIA_RECEBER_OPTIONS,
  STATUS_CONTA_LABEL,
  STATUS_CONTA_RECEBER_OPTIONS,
  FORMA_PAGAMENTO_LABEL,
  FORMA_PAGAMENTO_OPTIONS,
  isoToInputDate,
} from "@/lib/data/financeiro";
import {
  createContaReceber,
  updateContaReceber,
} from "@/services/contas-receber";
import { listClientes, type Cliente } from "@/services/clientes";
import { extractApiError } from "@/lib/utils/api-errors";
import type {
  CategoriaReceber,
  StatusConta,
  FormaPagamento,
} from "@/services/api/enums";

const CATEGORIAS_VALUES = CATEGORIA_RECEBER_OPTIONS as readonly CategoriaReceber[];
const STATUS_VALUES = STATUS_CONTA_RECEBER_OPTIONS as readonly StatusConta[];
const FORMA_VALUES = FORMA_PAGAMENTO_OPTIONS as readonly FormaPagamento[];

const schema = z.object({
  descricao: z.string().min(3, "Descrição obrigatória (mín. 3 caracteres)"),
  categoria: z.enum(CATEGORIAS_VALUES as unknown as [string, ...string[]]),
  clienteId: z.string().optional(),
  valor: z
    .number({ message: "Valor obrigatório" })
    .positive("Valor deve ser maior que zero"),
  vencimento: z.string().min(1, "Vencimento obrigatório"),
  status: z.enum(STATUS_VALUES as unknown as [string, ...string[]]),
  dataRecebimento: z.string().optional(),
  formaPagamento: z.string().optional(),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ContaReceberFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  conta: ContaReceber | null;
}

const fieldLabel =
  "text-white/60 text-xs font-bold uppercase tracking-wider block mb-1.5";
const fieldInput =
  "bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-green-500/50 h-9 text-sm";
const fieldSelect =
  "w-full bg-white/5 border border-white/10 text-white focus:border-green-500/50 h-9 px-3 rounded-md focus:outline-none text-sm";
const fieldError = "text-red-400 text-xs mt-1";

export function ContaReceberForm({
  isOpen,
  onOpenChange,
  onSaved,
  conta,
}: ContaReceberFormProps) {
  const isEdit = conta !== null;

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
      categoria: "VENDA",
      clienteId: "",
      valor: 0,
      vencimento: "",
      status: "PENDENTE",
      dataRecebimento: "",
      formaPagamento: "",
      observacoes: "",
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoadingClientes(true);
    listClientes({ limit: 100, status: "ATIVO" })
      .then((res) => {
        if (cancelled) return;
        setClientes(res.data);
      })
      .catch(() => {
        if (!cancelled) setClientes([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingClientes(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setSubmitError(null);
      reset({
        descricao: conta?.descricao ?? "",
        categoria: conta?.categoria ?? "VENDA",
        clienteId: conta?.clienteId ?? "",
        valor: conta ? Number(conta.valor) : 0,
        vencimento: isoToInputDate(conta?.vencimento) ?? "",
        status: conta?.status ?? "PENDENTE",
        dataRecebimento: isoToInputDate(conta?.dataRecebimento) ?? "",
        formaPagamento: conta?.formaPagamento ?? "",
        observacoes: conta?.observacoes ?? "",
      });
    }
  }, [isOpen, conta, reset]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onOpenChange(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onOpenChange, submitting]);

  const status = watch("status");
  const showDataRecebimento = status === "RECEBIDO";

  const submit = async (data: FormData) => {
    setSubmitError(null);
    setSubmitting(true);

    const payload = {
      descricao: data.descricao.trim(),
      categoria: data.categoria as CategoriaReceber,
      clienteId: data.clienteId || undefined,
      valor: data.valor,
      vencimento: data.vencimento,
      status: data.status as StatusConta,
      dataRecebimento:
        data.status === "RECEBIDO"
          ? data.dataRecebimento || new Date().toISOString().slice(0, 10)
          : undefined,
      formaPagamento: data.formaPagamento
        ? (data.formaPagamento as FormaPagamento)
        : undefined,
      observacoes: data.observacoes?.trim() || undefined,
    };

    try {
      if (isEdit && conta) {
        await updateContaReceber(conta.id, {
          ...payload,
          clienteId: payload.clienteId ?? null,
          dataRecebimento: payload.dataRecebimento ?? null,
          formaPagamento: payload.formaPagamento ?? null,
          observacoes: payload.observacoes ?? null,
        });
      } else {
        await createContaReceber(payload);
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setSubmitError(
        extractApiError(
          err,
          isEdit ? "Erro ao salvar alterações." : "Erro ao criar conta."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto"
      onClick={() => !submitting && onOpenChange(false)}
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
            onClick={() => !submitting && onOpenChange(false)}
            disabled={submitting}
            className="text-white/50 hover:text-white transition-colors disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {submitError && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="flex-1 text-red-400 text-sm font-medium">
                  {submitError}
                </p>
              </div>
            )}

            <div>
              <label className={fieldLabel}>Descrição *</label>
              <Input
                {...register("descricao")}
                placeholder="Ex.: Venda Pedido #1254, Serviço de instalação..."
                className={fieldInput}
              />
              {errors.descricao && (
                <p className={fieldError}>{errors.descricao.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={fieldLabel}>Categoria *</label>
                <select {...register("categoria")} className={fieldSelect}>
                  {CATEGORIA_RECEBER_OPTIONS.map((c) => (
                    <option key={c} value={c} className="bg-primary">
                      {CATEGORIA_RECEBER_LABEL[c]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={fieldLabel}>Cliente</label>
                <select
                  {...register("clienteId")}
                  className={fieldSelect}
                  disabled={loadingClientes}
                >
                  <option value="" className="bg-primary">
                    {loadingClientes
                      ? "Carregando..."
                      : clientes.length === 0
                      ? "Nenhum cliente ativo"
                      : "—"}
                  </option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id} className="bg-primary">
                      {c.nome}
                    </option>
                  ))}
                </select>
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
                {errors.valor && (
                  <p className={fieldError}>{errors.valor.message}</p>
                )}
              </div>

              <div>
                <label className={fieldLabel}>Vencimento *</label>
                <Input
                  type="date"
                  {...register("vencimento")}
                  className={fieldInput}
                />
                {errors.vencimento && (
                  <p className={fieldError}>{errors.vencimento.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={fieldLabel}>Status *</label>
                <select {...register("status")} className={fieldSelect}>
                  {STATUS_CONTA_RECEBER_OPTIONS.map((s) => (
                    <option key={s} value={s} className="bg-primary">
                      {STATUS_CONTA_LABEL[s]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={fieldLabel}>Forma de Recebimento</label>
                <select {...register("formaPagamento")} className={fieldSelect}>
                  <option value="" className="bg-primary">—</option>
                  {FORMA_PAGAMENTO_OPTIONS.map((f) => (
                    <option key={f} value={f} className="bg-primary">
                      {FORMA_PAGAMENTO_LABEL[f]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {showDataRecebimento && (
              <div>
                <label className={fieldLabel}>Data do Recebimento</label>
                <Input
                  type="date"
                  {...register("dataRecebimento")}
                  className={fieldInput}
                />
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
              disabled={submitting}
              onClick={() => onOpenChange(false)}
              className="border border-white/10 text-white hover:bg-white/10 disabled:opacity-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-green-500 hover:bg-green-400 text-white font-bold disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {submitting
                ? "Salvando..."
                : isEdit
                ? "Salvar Alterações"
                : "Criar Conta"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
