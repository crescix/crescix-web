"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Plus, Trash2, ArrowLeft, Save, Loader2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  STATUS_ORCAMENTO_LABEL,
  STATUS_ORCAMENTO_OPTIONS,
  isoToInputDate,
  nextOrcamentoNumero,
} from "@/lib/data/orcamentos";
import type { StatusOrcamento } from "@/services/api/enums";
import {
  createOrcamento,
  getOrcamento,
  updateOrcamento,
  listOrcamentos,
} from "@/services/orcamentos";
import { listClientes, type Cliente } from "@/services/clientes";
import { listProdutos, type Produto } from "@/services/produtos";
import { extractApiError } from "@/lib/utils/api-errors";

interface OrcamentoFormProps {
  mode: "novo" | "editar";
  orcamentoId?: string;
}

interface ItemForm {
  localId: string;
  produtoId?: string;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  descontoItem: number;
}

function newItem(): ItemForm {
  return {
    localId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    produtoNome: "",
    quantidade: 1,
    precoUnitario: 0,
    descontoItem: 0,
  };
}

function formatBRL(v: number): string {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

export function OrcamentoForm({ mode, orcamentoId }: OrcamentoFormProps) {
  const router = useRouter();

  const [numero, setNumero] = useState("");
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [validade, setValidade] = useState("");
  const [clienteId, setClienteId] = useState<string>("");
  const [clienteNome, setClienteNome] = useState<string>("");
  const [status, setStatus] = useState<StatusOrcamento>("ABERTO");
  const [itens, setItens] = useState<ItemForm[]>([newItem()]);
  const [observacoes, setObservacoes] = useState("");
  const [descontoGeral, setDescontoGeral] = useState(0);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    setLoadingInitial(true);
    setLoadError(null);

    Promise.all([
      listClientes({ limit: 100, status: "ATIVO" }),
      listProdutos({ limit: 100 }),
      mode === "editar" && orcamentoId ? getOrcamento(orcamentoId) : Promise.resolve(null),
      mode === "novo" ? listOrcamentos({ limit: 100 }) : Promise.resolve(null),
    ])
      .then(([clientesRes, produtosRes, orcRes, orcamentosListRes]) => {
        if (cancelled) return;
        setClientes(clientesRes.data);
        setProdutos(produtosRes.data);

        if (mode === "editar" && orcRes) {
          setNumero(orcRes.numero);
          setData(isoToInputDate(orcRes.data));
          setValidade(isoToInputDate(orcRes.validade));
          setClienteId(orcRes.clienteId ?? "");
          setClienteNome(orcRes.clienteNome);
          setStatus(orcRes.status);
          setDescontoGeral(Number(orcRes.descontoGeral));
          setObservacoes(orcRes.observacoes ?? "");
          setItens(
            orcRes.itens.length > 0
              ? orcRes.itens.map((it) => ({
                  localId: it.id,
                  produtoId: it.produtoId ?? undefined,
                  produtoNome: it.produtoNome,
                  quantidade: it.quantidade,
                  precoUnitario: Number(it.precoUnitario),
                  descontoItem: Number(it.descontoItem),
                }))
              : [newItem()]
          );
        } else if (mode === "novo" && orcamentosListRes) {
          setNumero(nextOrcamentoNumero(orcamentosListRes.data));
          const v = new Date();
          v.setDate(v.getDate() + 14);
          setValidade(v.toISOString().slice(0, 10));
        }
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          mode === "editar" && axios.isAxiosError(err) && err.response?.status === 404
            ? "Orçamento não encontrado."
            : extractApiError(err, "Erro ao carregar dados do orçamento.");
        setLoadError(message);
      })
      .finally(() => {
        if (!cancelled) setLoadingInitial(false);
      });

    return () => { cancelled = true; };
  }, [mode, orcamentoId]);

  const subtotal = useMemo(
    () =>
      itens.reduce(
        (sum, i) => sum + i.quantidade * i.precoUnitario * (1 - i.descontoItem / 100),
        0
      ),
    [itens]
  );
  const descontoValor = subtotal * (descontoGeral / 100);
  const total = subtotal - descontoValor;

  const addItem = () => setItens((p) => [...p, newItem()]);
  const removeItem = (localId: string) => {
    if (itens.length === 1) return;
    setItens((p) => p.filter((i) => i.localId !== localId));
  };
  const updateItem = useCallback(
    (localId: string, field: keyof ItemForm, value: string | number) => {
      setItens((prev) =>
        prev.map((item) => {
          if (item.localId !== localId) return item;
          const updated = { ...item, [field]: value };
          if (field === "produtoId") {
            const found = produtos.find((p) => p.id === value);
            if (found) {
              updated.produtoNome = found.nome;
              updated.precoUnitario = Number(found.preco);
            }
          }
          return updated;
        })
      );
    },
    [produtos]
  );

  const onClienteChange = (id: string) => {
    setClienteId(id);
    const found = clientes.find((c) => c.id === id);
    setClienteNome(found?.nome ?? "");
    setErrors((p) => ({ ...p, cliente: "" }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!numero.trim()) errs.numero = "Informe o número.";
    if (!data) errs.data = "Informe a data.";
    if (!validade) errs.validade = "Informe a validade.";
    if (!clienteNome.trim()) errs.cliente = "Selecione um cliente.";
    if (itens.some((i) => !i.produtoNome.trim())) {
      errs.itens = "Todos os itens precisam de um produto.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    if (!validate()) return;

    const payload = {
      numero: numero.trim(),
      data,
      validade,
      clienteId: clienteId || undefined,
      clienteNome: clienteNome.trim(),
      itens: itens.map((i) => ({
        produtoId: i.produtoId,
        produtoNome: i.produtoNome.trim(),
        quantidade: i.quantidade,
        precoUnitario: i.precoUnitario,
        descontoItem: i.descontoItem,
      })),
      descontoGeral,
      observacoes: observacoes.trim() || undefined,
      status,
    };

    setSubmitting(true);
    try {
      if (mode === "novo") {
        await createOrcamento(payload);
      } else if (orcamentoId) {
        await updateOrcamento(orcamentoId, payload);
      }
      router.push("/vendas/orcamentos");
    } catch (err) {
      setSubmitError(
        extractApiError(
          err,
          mode === "novo" ? "Erro ao criar o orçamento." : "Erro ao salvar as alterações."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-green-500/50 h-9 text-sm";
  const selectCls =
    "w-full h-9 px-3 text-sm rounded-md border focus:outline-none bg-white/5 border-white/10 text-white focus:border-green-500/50";
  const labelCls = "text-white/50 text-xs font-medium block mb-1.5";
  const cardCls = "bg-primary rounded-2xl border border-white/5 p-6";

  if (loadingInitial) {
    return (
      <div className="w-full min-h-screen bg-secondary flex items-center justify-center">
        <div className="flex items-center gap-3 text-white/60">
          <Loader2 className="w-5 h-5 animate-spin text-green-400" />
          <span className="text-sm">
            {mode === "editar" ? "Carregando orçamento..." : "Carregando..."}
          </span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full min-h-screen bg-secondary flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="bg-red-500/10 rounded-2xl p-6 inline-block">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          </div>
          <p className="text-white/80 font-medium">{loadError}</p>
          <Link
            href="/vendas/orcamentos"
            className="inline-flex items-center gap-2 text-green-400 hover:underline text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para orçamentos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-secondary p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl space-y-6">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/vendas/orcamentos">
              <button className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/60 hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </button>
            </Link>
            <div>
              <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">
                Vendas / Orçamentos
              </p>
              <h1 className="text-3xl font-black text-white tracking-tighter">
                {mode === "novo" ? "Novo Orçamento" : `Editar ${numero}`}
              </h1>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/vendas/orcamentos">
              <Button
                variant="ghost"
                disabled={submitting}
                className="border border-white/10 text-white hover:bg-white/10"
              >
                Cancelar
              </Button>
            </Link>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-500 hover:bg-green-400 text-white font-bold rounded-full px-5 transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {submitting ? "Salvando..." : mode === "novo" ? "Criar Orçamento" : "Salvar Alterações"}
            </Button>
          </div>
        </div>

        {submitError && (
          <div className="flex flex-wrap items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="flex-1 text-red-400 text-sm font-medium">{submitError}</p>
            <button onClick={() => setSubmitError(null)} className="text-red-400/60 hover:text-red-400">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className={cardCls}>
          <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">
            Dados do Orçamento
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={labelCls}>Número *</label>
              <Input
                value={numero}
                onChange={(e) => { setNumero(e.target.value); setErrors((p) => ({ ...p, numero: "" })); }}
                placeholder="#ORC-0001"
                className={inputCls}
              />
              {errors.numero && <p className="text-red-400 text-xs mt-1">{errors.numero}</p>}
            </div>

            <div>
              <label className={labelCls}>Data *</label>
              <Input
                type="date"
                value={data}
                onChange={(e) => { setData(e.target.value); setErrors((p) => ({ ...p, data: "" })); }}
                className={inputCls}
              />
              {errors.data && <p className="text-red-400 text-xs mt-1">{errors.data}</p>}
            </div>

            <div>
              <label className={labelCls}>Validade *</label>
              <Input
                type="date"
                value={validade}
                onChange={(e) => { setValidade(e.target.value); setErrors((p) => ({ ...p, validade: "" })); }}
                className={inputCls}
              />
              {errors.validade && <p className="text-red-400 text-xs mt-1">{errors.validade}</p>}
            </div>

            <div>
              <label className={labelCls}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusOrcamento)}
                className={selectCls}
              >
                {STATUS_ORCAMENTO_OPTIONS.map((s) => (
                  <option key={s} value={s}>{STATUS_ORCAMENTO_LABEL[s]}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-4">
              <label className={labelCls}>Cliente *</label>
              <select
                value={clienteId}
                onChange={(e) => onClienteChange(e.target.value)}
                className={selectCls}
              >
                <option value="">
                  {clientes.length === 0 ? "Nenhum cliente ativo cadastrado" : "Selecionar cliente..."}
                </option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
              {errors.cliente && <p className="text-red-400 text-xs mt-1">{errors.cliente}</p>}
              {clientes.length === 0 && (
                <p className="text-white/30 text-xs mt-1">
                  <Link href="/clientes/cadastro" className="text-green-400 hover:underline">
                    Cadastre um cliente
                  </Link>{" "}
                  antes de criar um orçamento.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className={cardCls}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">
              Itens do Orçamento
            </p>
            <Button
              onClick={addItem}
              variant="ghost"
              className="text-green-400 hover:text-green-300 hover:bg-green-400/10 h-8 px-3 text-sm"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Adicionar Item
            </Button>
          </div>

          {errors.itens && <p className="text-red-400 text-xs mb-3">{errors.itens}</p>}

          <div className="hidden md:grid grid-cols-[2fr_70px_140px_110px_120px_36px] gap-3 px-3 mb-2">
            {["Produto", "Qtd.", "Preço Unit.", "Desc. (%)", "Subtotal", ""].map((h, i) => (
              <span key={i} className="text-white/40 text-xs font-semibold uppercase tracking-wider">{h}</span>
            ))}
          </div>

          <div className="space-y-2">
            {itens.map((item) => {
              const sub = item.quantidade * item.precoUnitario * (1 - item.descontoItem / 100);
              return (
                <div
                  key={item.localId}
                  className="grid grid-cols-1 md:grid-cols-[2fr_70px_140px_110px_120px_36px] gap-3 items-center bg-white/[0.03] border border-white/5 rounded-xl p-3"
                >
                  <select
                    value={item.produtoId ?? ""}
                    onChange={(e) => updateItem(item.localId, "produtoId", e.target.value)}
                    className={selectCls}
                  >
                    <option value="">
                      {produtos.length === 0 ? "Nenhum produto" : "Produto..."}
                    </option>
                    {produtos.map((p) => (
                      <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                  </select>

                  <Input
                    type="number"
                    min={1}
                    value={item.quantidade}
                    onChange={(e) => updateItem(item.localId, "quantidade", Math.max(1, Number(e.target.value)))}
                    className={inputCls}
                  />

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs pointer-events-none">R$</span>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.precoUnitario}
                      onChange={(e) => updateItem(item.localId, "precoUnitario", Number(e.target.value))}
                      className={`${inputCls} pl-9`}
                    />
                  </div>

                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={item.descontoItem}
                      onChange={(e) => updateItem(item.localId, "descontoItem", Math.min(100, Number(e.target.value)))}
                      className={`${inputCls} pr-8`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-xs pointer-events-none">%</span>
                  </div>

                  <div className="h-9 flex items-center px-3 bg-white/5 border border-white/10 rounded-md text-sm text-white/60 font-medium tabular-nums">
                    R$ {formatBRL(sub)}
                  </div>

                  <button
                    onClick={() => removeItem(item.localId)}
                    disabled={itens.length === 1}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-white/25 hover:text-red-400 disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
          <div className={cardCls}>
            <label className={labelCls}>Observações</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Condições de pagamento, prazo de entrega, garantia..."
              rows={6}
              className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:border-green-500/50 rounded-md px-3 py-2 text-sm resize-none focus:outline-none"
            />
          </div>

          <div className={`${cardCls} flex flex-col justify-between`}>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">
              Resumo
            </p>

            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Subtotal</span>
                <span className="text-white font-medium tabular-nums">R$ {formatBRL(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-white/60 text-sm shrink-0">Desconto geral</span>
                <div className="relative w-28">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={descontoGeral}
                    onChange={(e) => setDescontoGeral(Math.min(100, Number(e.target.value)))}
                    className={`${inputCls} pr-8 text-right`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-xs pointer-events-none">%</span>
                </div>
              </div>

              {descontoGeral > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Valor do desconto</span>
                  <span className="text-red-400 font-medium tabular-nums">- R$ {formatBRL(descontoValor)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 pt-4 mt-4 flex items-center justify-between">
              <span className="text-white font-bold text-lg">Total</span>
              <span className="text-green-400 text-2xl font-black tabular-nums">R$ {formatBRL(total)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
