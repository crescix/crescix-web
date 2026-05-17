"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import {
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  X,
  FileText,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  STATUS_PEDIDO_LABEL,
  STATUS_PEDIDO_OPTIONS,
  CONDICAO_PAGAMENTO_LABEL,
  CONDICAO_PAGAMENTO_OPTIONS,
  isoToInputDate,
  nextPedidoNumero,
} from "@/lib/data/vendas";
import type { StatusPedido, CondicaoPagamento } from "@/services/api/enums";
import {
  createPedido,
  getPedido,
  updatePedido,
  listPedidos,
} from "@/services/pedidos";
import { listClientes, type Cliente } from "@/services/clientes";
import { listProdutos, type Produto } from "@/services/produtos";
import { getOrcamento, type Orcamento } from "@/services/orcamentos";
import { extractApiError } from "@/lib/utils/api-errors";

interface PedidoFormProps {
  mode: "novo" | "editar";
  pedidoId?: string;
}

interface ItemForm {
  localId: string;
  produtoId?: string;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  descontoPercentual: number;
}

function newItem(): ItemForm {
  return {
    localId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    produtoNome: "",
    quantidade: 1,
    precoUnitario: 0,
    descontoPercentual: 0,
  };
}

function formatBRL(v: number): string {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

export function PedidoForm({ mode, pedidoId }: PedidoFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orcamentoIdParam = mode === "novo" ? searchParams.get("orcamento") : null;

  const [numero, setNumero] = useState("");
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [clienteId, setClienteId] = useState<string>("");
  const [clienteNome, setClienteNome] = useState<string>("");
  const [vendedorNome, setVendedorNome] = useState<string>("");
  const [status, setStatus] = useState<StatusPedido>("PENDENTE");
  const [itens, setItens] = useState<ItemForm[]>([newItem()]);
  const [observacoes, setObservacoes] = useState("");
  const [frete, setFrete] = useState<number>(0);
  const [condicaoPagamento, setCondicaoPagamento] = useState<CondicaoPagamento>("A_VISTA");
  const [orcamentoOrigem, setOrcamentoOrigem] = useState<Orcamento | null>(null);

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
      mode === "editar" && pedidoId ? getPedido(pedidoId) : Promise.resolve(null),
      mode === "novo" ? listPedidos({ limit: 100 }) : Promise.resolve(null),
      mode === "novo" && orcamentoIdParam
        ? getOrcamento(orcamentoIdParam).catch(() => null)
        : Promise.resolve(null),
    ])
      .then(([clientesRes, produtosRes, pedRes, pedidosListRes, orcRes]) => {
        if (cancelled) return;
        setClientes(clientesRes.data);
        setProdutos(produtosRes.data);

        if (mode === "editar" && pedRes) {
          setNumero(pedRes.numero);
          setData(isoToInputDate(pedRes.data));
          setClienteId(pedRes.clienteId ?? "");
          setClienteNome(pedRes.clienteNome);
          setVendedorNome(pedRes.vendedorNome ?? "");
          setStatus(pedRes.status);
          setFrete(Number(pedRes.frete));
          setCondicaoPagamento(pedRes.condicaoPagamento ?? "A_VISTA");
          setObservacoes(pedRes.observacoes ?? "");
          setItens(
            pedRes.itens.length > 0
              ? pedRes.itens.map((it) => ({
                  localId: it.id,
                  produtoId: it.produtoId ?? undefined,
                  produtoNome: it.produtoNome,
                  quantidade: it.quantidade,
                  precoUnitario: Number(it.precoUnitario),
                  descontoPercentual: Number(it.descontoPercentual),
                }))
              : [newItem()]
          );
        } else if (mode === "novo" && pedidosListRes) {
          setNumero(nextPedidoNumero(pedidosListRes.data));

          if (orcRes) {
            // Pré-preenche a partir do orçamento de origem
            setOrcamentoOrigem(orcRes);
            setClienteId(orcRes.clienteId ?? "");
            setClienteNome(orcRes.clienteNome);
            if (orcRes.observacoes) setObservacoes(orcRes.observacoes);
            if (orcRes.itens.length > 0) {
              setItens(
                orcRes.itens.map((it) => ({
                  localId: `${it.id}-${Date.now()}`,
                  produtoId: it.produtoId ?? undefined,
                  produtoNome: it.produtoNome,
                  quantidade: it.quantidade,
                  precoUnitario: Number(it.precoUnitario),
                  descontoPercentual: Number(it.descontoItem),
                }))
              );
            }
          }
        }
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          mode === "editar" && axios.isAxiosError(err) && err.response?.status === 404
            ? "Pedido não encontrado."
            : extractApiError(err, "Erro ao carregar dados do pedido.");
        setLoadError(message);
      })
      .finally(() => {
        if (!cancelled) setLoadingInitial(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mode, pedidoId, orcamentoIdParam]);

  const subtotal = useMemo(
    () =>
      itens.reduce(
        (sum, i) =>
          sum + i.quantidade * i.precoUnitario * (1 - i.descontoPercentual / 100),
        0
      ),
    [itens]
  );
  const total = subtotal + (Number.isFinite(frete) ? frete : 0);

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

  const handleDesvincular = () => {
    setOrcamentoOrigem(null);
    router.replace("/vendas/pedidos/novo");
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!numero.trim()) errs.numero = "Informe o número.";
    if (!data) errs.data = "Informe a data.";
    if (!clienteNome.trim()) errs.cliente = "Selecione um cliente.";
    if (itens.length === 0) errs.itens = "Adicione ao menos um item.";
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
      clienteId: clienteId || undefined,
      clienteNome: clienteNome.trim(),
      vendedorNome: vendedorNome.trim() || undefined,
      itens: itens.map((i) => ({
        produtoId: i.produtoId,
        produtoNome: i.produtoNome.trim(),
        quantidade: i.quantidade,
        precoUnitario: i.precoUnitario,
        descontoPercentual: i.descontoPercentual,
      })),
      frete,
      condicaoPagamento,
      observacoes: observacoes.trim() || undefined,
      status,
      ...(mode === "novo" && orcamentoOrigem
        ? { orcamentoOrigemId: orcamentoOrigem.id }
        : {}),
    };

    setSubmitting(true);
    try {
      if (mode === "novo") {
        await createPedido(payload);
      } else if (pedidoId) {
        await updatePedido(pedidoId, payload);
      }
      router.push("/vendas/pedidos");
    } catch (err) {
      setSubmitError(
        extractApiError(
          err,
          mode === "novo" ? "Erro ao criar o pedido." : "Erro ao salvar as alterações."
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
            {mode === "editar" ? "Carregando pedido..." : "Carregando..."}
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
            href="/vendas/pedidos"
            className="inline-flex items-center gap-2 text-green-400 hover:underline text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para pedidos
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
            <Link href="/vendas/pedidos">
              <button className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/60 hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </button>
            </Link>
            <div>
              <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">
                Vendas / Pedidos
              </p>
              <h1 className="text-3xl font-black text-white tracking-tighter">
                {mode === "novo"
                  ? orcamentoOrigem
                    ? "Converter Orçamento em Pedido"
                    : "Novo Pedido"
                  : `Editar ${numero}`}
              </h1>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/vendas/pedidos">
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
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {submitting
                ? "Salvando..."
                : mode === "novo"
                ? "Criar Pedido"
                : "Salvar Alterações"}
            </Button>
          </div>
        </div>

        {orcamentoOrigem && (
          <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/25 rounded-2xl p-4">
            <div className="bg-green-500/20 rounded-xl p-2 flex-shrink-0">
              <FileText className="h-4 w-4 text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold">
                Convertendo orçamento em pedido
              </p>
              <p className="text-white/60 text-xs mt-0.5">
                Os itens e cliente do orçamento{" "}
                <Link
                  href={`/vendas/orcamentos/${orcamentoOrigem.id}/editar`}
                  className="text-green-400 font-medium hover:underline inline-flex items-center gap-1"
                >
                  {orcamentoOrigem.numero}
                  <ExternalLink className="h-3 w-3" />
                </Link>{" "}
                foram pré-carregados. Revise antes de finalizar.
              </p>
            </div>
            <button
              onClick={handleDesvincular}
              title="Desvincular do orçamento"
              className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {submitError && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="flex-1 text-red-400 text-sm font-medium">{submitError}</p>
            <button
              onClick={() => setSubmitError(null)}
              className="text-red-400/60 hover:text-red-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className={cardCls}>
          <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">
            Dados do Pedido
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={labelCls}>Número *</label>
              <Input
                value={numero}
                onChange={(e) => {
                  setNumero(e.target.value);
                  setErrors((p) => ({ ...p, numero: "" }));
                }}
                placeholder="#000001"
                className={inputCls}
              />
              {errors.numero && (
                <p className="text-red-400 text-xs mt-1">{errors.numero}</p>
              )}
            </div>

            <div>
              <label className={labelCls}>Data *</label>
              <Input
                type="date"
                value={data}
                onChange={(e) => {
                  setData(e.target.value);
                  setErrors((p) => ({ ...p, data: "" }));
                }}
                className={inputCls}
              />
              {errors.data && (
                <p className="text-red-400 text-xs mt-1">{errors.data}</p>
              )}
            </div>

            <div>
              <label className={labelCls}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusPedido)}
                className={selectCls}
              >
                {STATUS_PEDIDO_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_PEDIDO_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Vendedor</label>
              <Input
                value={vendedorNome}
                onChange={(e) => setVendedorNome(e.target.value)}
                placeholder="Nome do vendedor"
                className={inputCls}
              />
            </div>

            <div className="md:col-span-2 lg:col-span-4">
              <label className={labelCls}>Cliente *</label>
              <select
                value={clienteId}
                onChange={(e) => onClienteChange(e.target.value)}
                className={selectCls}
              >
                <option value="">
                  {clientes.length === 0
                    ? "Nenhum cliente ativo cadastrado"
                    : "Selecionar cliente..."}
                </option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
              {errors.cliente && (
                <p className="text-red-400 text-xs mt-1">{errors.cliente}</p>
              )}
              {clientes.length === 0 && (
                <p className="text-white/30 text-xs mt-1">
                  <Link
                    href="/clientes/cadastro"
                    className="text-green-400 hover:underline"
                  >
                    Cadastre um cliente
                  </Link>{" "}
                  antes de criar um pedido.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className={cardCls}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">
              Itens do Pedido
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

          {errors.itens && (
            <p className="text-red-400 text-xs mb-3">{errors.itens}</p>
          )}

          <div className="hidden md:grid grid-cols-[2fr_70px_140px_110px_120px_36px] gap-3 px-3 mb-2">
            {["Produto", "Qtd.", "Preço Unit.", "Desc. (%)", "Subtotal", ""].map(
              (h, i) => (
                <span
                  key={i}
                  className="text-white/40 text-xs font-semibold uppercase tracking-wider"
                >
                  {h}
                </span>
              )
            )}
          </div>

          <div className="space-y-2">
            {itens.map((item) => {
              const sub =
                item.quantidade *
                item.precoUnitario *
                (1 - item.descontoPercentual / 100);
              return (
                <div
                  key={item.localId}
                  className="grid grid-cols-1 md:grid-cols-[2fr_70px_140px_110px_120px_36px] gap-3 items-center bg-white/[0.03] border border-white/5 rounded-xl p-3"
                >
                  <select
                    value={item.produtoId ?? ""}
                    onChange={(e) =>
                      updateItem(item.localId, "produtoId", e.target.value)
                    }
                    className={selectCls}
                  >
                    <option value="">
                      {produtos.length === 0 ? "Nenhum produto" : "Produto..."}
                    </option>
                    {produtos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome}
                      </option>
                    ))}
                  </select>

                  <Input
                    type="number"
                    min={1}
                    value={item.quantidade}
                    onChange={(e) =>
                      updateItem(
                        item.localId,
                        "quantidade",
                        Math.max(1, Number(e.target.value))
                      )
                    }
                    className={inputCls}
                  />

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs pointer-events-none">
                      R$
                    </span>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.precoUnitario}
                      onChange={(e) =>
                        updateItem(
                          item.localId,
                          "precoUnitario",
                          Number(e.target.value)
                        )
                      }
                      className={`${inputCls} pl-9`}
                    />
                  </div>

                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={item.descontoPercentual}
                      onChange={(e) =>
                        updateItem(
                          item.localId,
                          "descontoPercentual",
                          Math.min(100, Number(e.target.value))
                        )
                      }
                      className={`${inputCls} pr-8`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-xs pointer-events-none">
                      %
                    </span>
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
              placeholder="Detalhes da entrega, condições especiais..."
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
                <span className="text-white font-medium tabular-nums">
                  R$ {formatBRL(subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-white/60 text-sm shrink-0">Frete</span>
                <div className="relative w-32">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs pointer-events-none">
                    R$
                  </span>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={frete}
                    onChange={(e) =>
                      setFrete(Math.max(0, Number(e.target.value)))
                    }
                    className={`${inputCls} pl-9 text-right`}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Condição de pagamento</label>
                <select
                  value={condicaoPagamento}
                  onChange={(e) =>
                    setCondicaoPagamento(e.target.value as CondicaoPagamento)
                  }
                  className={selectCls}
                >
                  {CONDICAO_PAGAMENTO_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {CONDICAO_PAGAMENTO_LABEL[c]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 mt-4 flex items-center justify-between">
              <span className="text-white font-bold text-lg">Total</span>
              <span className="text-green-400 text-2xl font-black tabular-nums">
                R$ {formatBRL(total)}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
