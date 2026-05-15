"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Orcamento, ItemOrcamento, StatusOrcamento,
  clientesMock, produtosMock,
} from "@/lib/data/orcamentos";

interface ItemForm extends ItemOrcamento {}

interface OrcamentoFormProps {
  initialData?: Partial<Orcamento>;
  mode: "novo" | "editar";
  orcamentoNumero?: string;
}

function newItem(): ItemForm {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    produto: "", quantidade: 1, preco_unitario: 0, desconto_item: 0,
  };
}

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

function ddmmToISO(str: string): string {
  if (!str || !str.includes("/")) return "";
  const [d, m, y] = str.split("/");
  return `${y}-${m}-${d}`;
}

function isoToDDMM(str: string): string {
  if (!str || !str.includes("-")) return "";
  const [y, m, d] = str.split("-");
  return `${d}/${m}/${y}`;
}

export function OrcamentoForm({ initialData, mode, orcamentoNumero }: OrcamentoFormProps) {
  const router = useRouter();

  const [cliente,       setCliente]       = useState(initialData?.cliente ?? "");
  const [validade,      setValidade]      = useState(ddmmToISO(initialData?.validade ?? ""));
  const [status,        setStatus]        = useState<StatusOrcamento>(initialData?.status ?? "Aberto");
  const [itens,         setItens]         = useState<ItemForm[]>(
    initialData?.itens?.length ? initialData.itens : [newItem()]
  );
  const [observacoes,   setObservacoes]   = useState(initialData?.observacoes ?? "");
  const [descontoGeral, setDescontoGeral] = useState(initialData?.desconto_geral ?? 0);
  const [errors,        setErrors]        = useState<Record<string, string>>({});

  /* ── Cálculos ── */
  const subtotal = useMemo(() =>
    itens.reduce((sum, i) =>
      sum + i.quantidade * i.preco_unitario * (1 - i.desconto_item / 100), 0
    ), [itens]
  );
  const descontoValor = subtotal * (descontoGeral / 100);
  const total         = subtotal - descontoValor;

  /* ── Itens ── */
  const addItem    = () => setItens(p => [...p, newItem()]);
  const removeItem = (id: string) => {
    if (itens.length === 1) return;
    setItens(p => p.filter(i => i.id !== id));
  };
  const updateItem = (id: string, field: keyof ItemForm, value: string | number) => {
    setItens(p => p.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === "produto") {
        const found = produtosMock.find(p => p.nome === value);
        if (found) updated.preco_unitario = found.preco;
      }
      return updated;
    }));
  };

  /* ── Validação ── */
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!cliente)                          errs.cliente  = "Selecione um cliente.";
    if (!validade)                         errs.validade = "Informe a validade.";
    if (itens.some(i => !i.produto))       errs.itens    = "Selecione o produto em todos os itens.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    // TODO: conectar à API / context global
    console.log({ cliente, validade: isoToDDMM(validade), status, itens, observacoes, descontoGeral, total });
    router.push("/vendas/orcamentos");
  };

  /* ── Classes compartilhadas ── */
  const inputCls  = "bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-cyan-500/50 h-9 text-sm";
  const selectCls = `w-full h-9 px-3 text-sm rounded-md border focus:outline-none bg-white/5 border-white/10 text-white focus:border-cyan-500/50`;
  const labelCls  = "text-white/50 text-xs font-medium block mb-1.5";
  const cardCls   = "bg-primary rounded-2xl border border-white/5 p-6";

  return (
    <div className="w-full min-h-screen bg-secondary p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl space-y-6">

        {/* ── Header ── */}
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
                {mode === "novo" ? "Novo Orçamento" : `Editar ${orcamentoNumero ?? ""}`}
              </h1>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/vendas/orcamentos">
              <Button variant="ghost" className="border border-white/10 text-white hover:bg-white/10">
                Cancelar
              </Button>
            </Link>
            <Button
              onClick={handleSubmit}
              className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-full px-5 transition-all hover:scale-105 active:scale-95"
            >
              <Save className="mr-2 h-4 w-4" />
              {mode === "novo" ? "Criar Orçamento" : "Salvar Alterações"}
            </Button>
          </div>
        </div>

        {/* ── Dados principais ── */}
        <div className={cardCls}>
          <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">
            Dados do Orçamento
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cliente */}
            <div>
              <label className={labelCls}>Cliente *</label>
              <select
                value={cliente}
                onChange={(e) => { setCliente(e.target.value); setErrors(p => ({ ...p, cliente: "" })); }}
                className={selectCls}
              >
                <option value="">Selecionar cliente...</option>
                {clientesMock.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.cliente && <p className="text-red-400 text-xs mt-1">{errors.cliente}</p>}
            </div>

            {/* Validade */}
            <div>
              <label className={labelCls}>Validade *</label>
              <Input
                type="date"
                value={validade}
                onChange={(e) => { setValidade(e.target.value); setErrors(p => ({ ...p, validade: "" })); }}
                className={inputCls}
              />
              {errors.validade && <p className="text-red-400 text-xs mt-1">{errors.validade}</p>}
            </div>

            {/* Status */}
            <div>
              <label className={labelCls}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusOrcamento)}
                className={selectCls}
              >
                <option value="Aberto">Aberto</option>
                <option value="Aprovado">Aprovado</option>
                <option value="Recusado">Recusado</option>
                <option value="Expirado">Expirado</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Itens ── */}
        <div className={cardCls}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">
              Itens do Orçamento
            </p>
            <Button
              onClick={addItem}
              variant="ghost"
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 h-8 px-3 text-sm"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Adicionar Item
            </Button>
          </div>

          {errors.itens && <p className="text-red-400 text-xs mb-3">{errors.itens}</p>}

          {/* Cabeçalho colunas */}
          <div className="hidden md:grid grid-cols-[2fr_70px_140px_110px_120px_36px] gap-3 px-3 mb-2">
            {["Produto", "Qtd.", "Preço Unit.", "Desc. (%)", "Subtotal", ""].map((h, i) => (
              <span key={i} className="text-white/40 text-xs font-semibold uppercase tracking-wider">{h}</span>
            ))}
          </div>

          <div className="space-y-2">
            {itens.map((item) => {
              const sub = item.quantidade * item.preco_unitario * (1 - item.desconto_item / 100);
              return (
                <div
                  key={item.id}
                  className="grid grid-cols-1 md:grid-cols-[2fr_70px_140px_110px_120px_36px] gap-3 items-center bg-white/[0.03] border border-white/5 rounded-xl p-3"
                >
                  {/* Produto */}
                  <select
                    value={item.produto}
                    onChange={(e) => updateItem(item.id, "produto", e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Produto...</option>
                    {produtosMock.map(p => <option key={p.nome} value={p.nome}>{p.nome}</option>)}
                  </select>

                  {/* Quantidade */}
                  <Input
                    type="number" min={1}
                    value={item.quantidade}
                    onChange={(e) => updateItem(item.id, "quantidade", Math.max(1, Number(e.target.value)))}
                    className={inputCls}
                  />

                  {/* Preço unitário */}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs pointer-events-none">R$</span>
                    <Input
                      type="number" min={0} step={0.01}
                      value={item.preco_unitario}
                      onChange={(e) => updateItem(item.id, "preco_unitario", Number(e.target.value))}
                      className={`${inputCls} pl-9`}
                    />
                  </div>

                  {/* Desconto item */}
                  <div className="relative">
                    <Input
                      type="number" min={0} max={100}
                      value={item.desconto_item}
                      onChange={(e) => updateItem(item.id, "desconto_item", Math.min(100, Number(e.target.value)))}
                      className={`${inputCls} pr-8`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-xs pointer-events-none">%</span>
                  </div>

                  {/* Subtotal (somente leitura) */}
                  <div className="h-9 flex items-center px-3 bg-white/5 border border-white/10 rounded-md text-sm text-white/60 font-medium tabular-nums">
                    R$ {formatBRL(sub)}
                  </div>

                  {/* Remover */}
                  <button
                    onClick={() => removeItem(item.id)}
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

        {/* ── Observações + Totais ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">

          {/* Observações */}
          <div className={cardCls}>
            <label className={labelCls}>Observações</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Condições de pagamento, prazo de entrega, garantia..."
              rows={6}
              className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:border-cyan-500/50 rounded-md px-3 py-2 text-sm resize-none focus:outline-none"
            />
          </div>

          {/* Totais */}
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
                    type="number" min={0} max={100}
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
              <span className="text-cyan-400 text-2xl font-black tabular-nums">R$ {formatBRL(total)}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}