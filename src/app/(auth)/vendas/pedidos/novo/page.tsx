"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  clientesData,
  vendedoresData,
  condicoesPagamentoData,
  produtosData,
  ItemVenda,
  Cliente,
} from "@/lib/data/cadastro-vendas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Calendar, Plus, AlertCircle, CheckCircle2, PackageOpen } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

function generateItemId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function NovoPedidoPage() {
  const router = useRouter();

  // Block 1 — Quem?
  const [clienteId, setClienteId] = useState<string>(clientesData[0]?.id ?? "");
  const [dataEmissao, setDataEmissao] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [vendedorId, setVendedorId] = useState<string>(vendedoresData[0]?.id ?? "");

  // Block 2 — O Quê?
  const [itens, setItens] = useState<ItemVenda[]>([]);
  const [buscaProduto, setBuscaProduto] = useState("");
  const [quantidade, setQuantidade] = useState<string>("");
  const [precoUnitario, setPrecoUnitario] = useState<string>("");
  const [addError, setAddError] = useState<string>("");

  // Block 3 — Quanto e Como?
  const [frete, setFrete] = useState<string>("0");
  const [condicaoId, setCondicaoId] = useState<string>(
    condicoesPagamentoData[0]?.id ?? ""
  );

  // Estado de submissão
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string>("");

  // ─── Derivados ──────────────────────────────────────────────────────────────

  const clienteSelecionado = clientesData.find((c) => c.id === clienteId) ?? clientesData[0];
  const subtotal = itens.reduce((acc, item) => acc + item.subtotal, 0);
  const descontoTotal = itens.reduce((acc, item) => {
    const semDesconto = item.preco_unitario * item.quantidade;
    return acc + (semDesconto - item.subtotal);
  }, 0);
  const freteNum = parseFloat(frete) || 0;
  const total = subtotal - descontoTotal + freteNum;

  const saldoSuficiente = clienteSelecionado
    ? clienteSelecionado.saldo >= total
    : false;

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleAddItem = useCallback(() => {
    setAddError("");
    const qtd = parseInt(quantidade, 10);
    const preco = parseFloat(precoUnitario.replace(",", "."));

    if (!buscaProduto.trim()) {
      setAddError("Informe o nome ou SKU do produto.");
      return;
    }
    if (!qtd || qtd <= 0) {
      setAddError("Quantidade deve ser maior que zero.");
      return;
    }
    if (!preco || preco <= 0) {
      setAddError("Preço unitário deve ser maior que zero.");
      return;
    }

    // Tenta encontrar produto no catálogo (opcional)
    const produtoEncontrado = produtosData?.find(
      (p) =>
        p.nome.toLowerCase().includes(buscaProduto.toLowerCase()) ||
        p.sku?.toLowerCase().includes(buscaProduto.toLowerCase())
    );

    const novoItem: ItemVenda = {
      id: generateItemId(),
      produto: produtoEncontrado ?? { id: generateItemId(), nome: buscaProduto, sku: "", preco: preco },
      quantidade: qtd,
      preco_unitario: preco,
      desconto_percentual: 0,
      subtotal: qtd * preco,
    };

    setItens((prev) => [...prev, novoItem]);
    setBuscaProduto("");
    setQuantidade("");
    setPrecoUnitario("");
  }, [buscaProduto, quantidade, precoUnitario]);

  const handleUpdateDesconto = (itemId: string, desconto: number) => {
    setItens((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const desc = Math.min(100, Math.max(0, desconto));
        const subtotal =
          item.preco_unitario * item.quantidade * (1 - desc / 100);
        return { ...item, desconto_percentual: desc, subtotal };
      })
    );
  };

  const handleUpdateQuantidade = (itemId: string, novaQtd: number) => {
    setItens((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const qtd = Math.max(1, novaQtd);
        const subtotal =
          item.preco_unitario * qtd * (1 - item.desconto_percentual / 100);
        return { ...item, quantidade: qtd, subtotal };
      })
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setItens((prev) => prev.filter((item) => item.id !== itemId));
  };

  const validate = (): string => {
    if (!clienteId) return "Selecione um cliente.";
    if (!dataEmissao) return "Informe a data de emissão.";
    if (!vendedorId) return "Selecione um vendedor.";
    if (itens.length === 0) return "Adicione ao menos um item ao pedido.";
    if (!condicaoId) return "Selecione a condição de pagamento.";
    return "";
  };

  const handleFinalizar = async () => {
    const erro = validate();
    if (erro) {
      setFormError(erro);
      return;
    }
    setFormError("");
    setIsSubmitting(true);

    try {
      // Aqui você chamaria sua API: await criarPedido({ ... })
      await new Promise((res) => setTimeout(res, 800)); // Simula request
      router.push("/vendas/pedidos");
    } catch {
      setFormError("Erro ao salvar o pedido. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSalvarOrcamento = async () => {
    const erro = validate();
    if (erro) {
      setFormError(erro);
      return;
    }
    setFormError("");
    setIsSubmitting(true);

    try {
      // Aqui você chamaria sua API com status = "Orçamento"
      await new Promise((res) => setTimeout(res, 600));
      router.push("/vendas/pedidos");
    } catch {
      setFormError("Erro ao salvar o orçamento. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="w-full min-h-screen bg-secondary p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-7xl space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-1">
              Vendas / Pedidos
            </p>
            <h1 className="text-3xl font-black text-white tracking-tighter">
              Novo Pedido
            </h1>
          </div>
          <div className="text-white/20 font-mono text-sm bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
            #001255
          </div>
        </div>

        {/* Erro global */}
        {formError && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {formError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-5">

            {/* ── BLOCK 1: QUEM? ── */}
            <div className="bg-primary rounded-2xl border border-white/10 p-6 space-y-5">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="text-base font-bold text-white">Quem está comprando?</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Cliente */}
                <div className="space-y-1.5">
                  <label className="text-white/50 text-xs font-medium">
                    Cliente
                  </label>
                  <select
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-green-500/50 text-sm"
                  >
                    {clientesData.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                  {clienteSelecionado && (
                    <p
                      className={`text-xs flex items-center gap-1 ${
                        saldoSuficiente ? "text-green-400" : "text-yellow-400"
                      }`}
                    >
                      {saldoSuficiente ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <AlertCircle className="h-3 w-3" />
                      )}
                      Saldo: R$ {formatBRL(clienteSelecionado.saldo)}
                    </p>
                  )}
                </div>

                {/* Data de emissão */}
                <div className="space-y-1.5">
                  <label className="text-white/50 text-xs font-medium">
                    Data de emissão <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={dataEmissao}
                      onChange={(e) => setDataEmissao(e.target.value)}
                      className="bg-white/5 border-white/10 text-white focus:border-green-500/50 h-9 text-sm pr-9"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
                  </div>
                </div>

                {/* Vendedor */}
                <div className="space-y-1.5">
                  <label className="text-white/50 text-xs font-medium">
                    Vendedor <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={vendedorId}
                    onChange={(e) => setVendedorId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-green-500/50 text-sm"
                  >
                    {vendedoresData.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ── BLOCK 2: O QUÊ? ── */}
            <div className="bg-primary rounded-2xl border border-white/10 p-6 space-y-5">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="text-base font-bold text-white">O que está sendo vendido?</h2>
              </div>

              {/* Barra de adição */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_80px_120px_auto] gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
                <Input
                  placeholder="Nome ou SKU do produto"
                  value={buscaProduto}
                  onChange={(e) => setBuscaProduto(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-green-500/50 h-9 text-sm"
                />
                <Input
                  type="number"
                  placeholder="Qtd"
                  min={1}
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-green-500/50 h-9 text-sm"
                />
                <Input
                  type="text"
                  placeholder="Preço unit."
                  value={precoUnitario}
                  onChange={(e) => setPrecoUnitario(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-green-500/50 h-9 text-sm"
                />
                <Button
                  onClick={handleAddItem}
                  className="bg-green-500 hover:bg-green-400 text-white font-bold h-9 px-4 text-sm active:scale-95 transition-all"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>

              {addError && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {addError}
                </p>
              )}

              {/* Tabela de itens */}
              {itens.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 border border-dashed border-white/10 rounded-xl">
                  <PackageOpen className="h-8 w-8 text-white/15" />
                  <p className="text-white/30 text-sm">
                    Nenhum item adicionado ao pedido
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-white/10 hover:bg-transparent bg-white/5">
                        <TableHead className="text-white/40 text-xs w-10">#</TableHead>
                        <TableHead className="text-white/40 text-xs">Descrição</TableHead>
                        <TableHead className="text-white/40 text-xs w-20 text-center">Qtd</TableHead>
                        <TableHead className="text-white/40 text-xs w-28 text-right">Preço unit.</TableHead>
                        <TableHead className="text-white/40 text-xs w-24 text-center">Desc. %</TableHead>
                        <TableHead className="text-white/40 text-xs w-28 text-right">Subtotal</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itens.map((item, index) => (
                        <TableRow
                          key={item.id}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <TableCell className="text-white/30 text-xs font-mono">
                            {index + 1}
                          </TableCell>
                          <TableCell className="text-white text-sm font-medium">
                            {item.produto.nome}
                          </TableCell>
                          <TableCell className="text-center">
                            <input
                              type="number"
                              min={1}
                              value={item.quantidade}
                              onChange={(e) =>
                                handleUpdateQuantidade(item.id, parseInt(e.target.value, 10))
                              }
                              className="w-16 bg-white/5 border border-white/10 text-white text-center text-sm rounded-md px-2 py-1 focus:outline-none focus:border-green-500/50"
                            />
                          </TableCell>
                          <TableCell className="text-white/70 text-sm text-right">
                            R$ {formatBRL(item.preco_unitario)}
                          </TableCell>
                          <TableCell className="text-center">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={item.desconto_percentual}
                              onChange={(e) =>
                                handleUpdateDesconto(item.id, parseFloat(e.target.value))
                              }
                              className="w-16 bg-white/5 border border-white/10 text-white text-center text-sm rounded-md px-2 py-1 focus:outline-none focus:border-green-500/50"
                            />
                          </TableCell>
                          <TableCell className="text-white font-semibold text-sm text-right">
                            R$ {formatBRL(item.subtotal)}
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              title="Remover item"
                              aria-label="Remover item"
                              className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors group"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-white/30 group-hover:text-red-400 transition-colors" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {itens.length > 0 && (
                <div className="flex justify-between items-center text-sm px-1">
                  <span className="text-white/30">{itens.length} {itens.length === 1 ? "item" : "itens"}</span>
                  <span className="text-white/50">
                    Subtotal bruto:{" "}
                    <span className="text-white font-semibold">
                      R$ {formatBRL(itens.reduce((a, i) => a + i.preco_unitario * i.quantidade, 0))}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── BLOCK 3: QUANTO E COMO? ── */}
          <div className="bg-primary rounded-2xl border border-white/10 p-6 space-y-5 sticky top-6">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h2 className="text-base font-bold text-white">Quanto e como?</h2>
            </div>

            {/* Resumo de valores */}
            <div className="space-y-2.5 pb-4 border-b border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-white/50 text-sm">Subtotal</span>
                <span className="text-white text-sm font-semibold">
                  R$ {formatBRL(subtotal)}
                </span>
              </div>
              {descontoTotal > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-white/50 text-sm">Descontos</span>
                  <span className="text-red-400 text-sm font-semibold">
                    − R$ {formatBRL(descontoTotal)}
                  </span>
                </div>
              )}
              {/* Frete editável */}
              <div className="flex justify-between items-center gap-4">
                <span className="text-white/50 text-sm">Frete</span>
                <div className="flex items-center gap-1">
                  <span className="text-white/40 text-xs">R$</span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={frete}
                    onChange={(e) => setFrete(e.target.value)}
                    className="w-24 bg-white/5 border border-white/10 text-white text-right text-sm rounded-md px-2 py-1 focus:outline-none focus:border-green-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center bg-white/5 rounded-xl px-4 py-3">
              <span className="text-white font-bold text-sm">Total final</span>
              <span
                className={`text-2xl font-black ${
                  itens.length > 0 ? "text-green-400" : "text-white/20"
                }`}
              >
                R$ {formatBRL(total)}
              </span>
            </div>

            {/* Alerta de saldo */}
            {itens.length > 0 && !saldoSuficiente && (
              <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs px-3 py-2.5 rounded-lg">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                <span>
                  Saldo do cliente (R$ {formatBRL(clienteSelecionado?.saldo ?? 0)}) é insuficiente para este pedido.
                </span>
              </div>
            )}

            {/* Condição de pagamento */}
            <div className="space-y-1.5">
              <label className="text-white/50 text-xs font-medium">
                Condição de pagamento <span className="text-red-400">*</span>
              </label>
              <select
                value={condicaoId}
                onChange={(e) => setCondicaoId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-green-500/50 text-sm"
              >
                {condicoesPagamentoData.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.descricao}
                  </option>
                ))}
              </select>
            </div>

            {/* Ações */}
            <div className="space-y-2.5 pt-1">
              <Button
                onClick={handleFinalizar}
                disabled={isSubmitting}
                className="w-full bg-green-500 hover:bg-green-400 text-white font-bold text-sm h-11 rounded-xl active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Salvando..." : "Finalizar Venda"}
              </Button>

              <Button
                onClick={handleSalvarOrcamento}
                disabled={isSubmitting}
                className="w-full bg-transparent border border-green-500/50 hover:bg-green-500/10 text-green-400 font-bold text-sm h-11 rounded-xl active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Salvar Orçamento
              </Button>
            </div>

            <p className="text-white/20 text-xs text-center leading-relaxed">
              Ao finalizar, o estoque será atualizado automaticamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
