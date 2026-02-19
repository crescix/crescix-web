"use client";

import { useState } from "react";
import {
  clientesData,
  vendedoresData,
  condicoesPagamentoData,
  itensVendaInicial,
  ItemVenda,
  Cliente,
} from "@/lib/data/cadastro-vendas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Calendar } from "lucide-react";

export default function NovoPedidoPage() {
  const [itens, setItens] = useState<ItemVenda[]>(itensVendaInicial);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente>(
    clientesData[0]
  );
  const [dataEmissao, setDataEmissao] = useState("22/07/2024");
  const [vendedorSelecionado, setVendedorSelecionado] = useState(
    vendedoresData[0]
  );
  const [condicaoPagamento, setCondicaoPagamento] = useState(
    condicoesPagamentoData[2]
  );
  const desconto = 10.0;
  const frete = 20.0;

  const subtotal = itens.reduce((acc, item) => acc + item.subtotal, 0);
  const total = subtotal - desconto + frete;

  const handleRemoveItem = (itemId: string) => {
    setItens(itens.filter((item) => item.id !== itemId));
  };

  return (
    <div className="w-full bg-secondary p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-7xl space-y-6">
        <h1 className="text-3xl font-black text-white tracking-tighter">
          Novo Pedido
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* BLOCK 1: QUEM? */}
            <div className="bg-primary rounded-lg border border-white/10 p-6 space-y-4">
              <h2 className="text-lg font-bold text-white">
                Block 1: Quem?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-medium">
                    Cliente:
                  </label>
                  <select
                    value={clienteSelecionado.id}
                    onChange={(e) => {
                      const cliente = clientesData.find(
                        (c) => c.id === e.target.value
                      );
                      if (cliente) setClienteSelecionado(cliente);
                    }}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-md px-3 py-2 focus:outline-none focus:border-cyan-400"
                  >
                    {clientesData.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome} (Saldo: R${" "}
                        {cliente.saldo.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                        )
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-medium">
                    *Data de Emissão
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={dataEmissao}
                      onChange={(e) => setDataEmissao(e.target.value)}
                      className="pl-3 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-400 h-9"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-medium">
                    *Vendedor
                  </label>
                  <select
                    value={vendedorSelecionado.id}
                    onChange={(e) => {
                      const vendedor = vendedoresData.find(
                        (v) => v.id === e.target.value
                      );
                      if (vendedor) setVendedorSelecionado(vendedor);
                    }}
                    className="w-full bg-primary border border-white/10 text-white rounded-md px-3 py-2 focus:outline-none focus:border-cyan-400"
                  >
                    {vendedoresData.map((vendedor) => (
                      <option key={vendedor.id} value={vendedor.id}>
                        {vendedor.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* BLOCK 2: O QUÊ? */}
            <div className="bg-primary rounded-lg border border-white/10 p-6 space-y-4">
              <h2 className="text-lg font-bold text-white">
                Block 2: O Quê?
              </h2>

              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Buscar Produto (Nome ou SKU)"
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-400 h-9"
                />
                <Input
                  type="number"
                  placeholder="Quantidade"
                  className="w-24 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-400 h-9"
                />
                <Input
                  type="number"
                  placeholder="Preço Unitário"
                  className="w-32 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-400 h-9"
                />
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold h-9 px-4">
                  Adicionar
                </Button>
              </div>

              <div className="rounded-lg border border-white/10 overflow-hidden bg-white/5">
                <Table>
                  <TableHeader className="bg-white/5 border-b border-white/10">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-white/60 font-semibold">
                        Item #
                      </TableHead>
                      <TableHead className="text-white/60 font-semibold">
                        Descrição
                      </TableHead>
                      <TableHead className="text-white/60 font-semibold">
                        Qtd
                      </TableHead>
                      <TableHead className="text-white/60 font-semibold">
                        Preço Unit.
                      </TableHead>
                      <TableHead className="text-white/60 font-semibold">
                        Desconto
                      </TableHead>
                      <TableHead className="text-white/60 font-semibold">
                        Subtotal
                      </TableHead>
                      <TableHead className="text-white/60 font-semibold text-center">
                        Ação
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itens.map((item, index) => (
                      <TableRow
                        key={item.id}
                        className="border-b border-white/10 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-3 text-white">{index + 1}</td>
                        <td className="px-6 py-3 text-white">
                          {item.produto.nome}
                        </td>
                        <td className="px-6 py-3 text-white">
                          {item.quantidade}
                        </td>
                        <td className="px-6 py-3 text-white">
                          R${" "}
                          {item.preco_unitario.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-6 py-3 text-white">
                          {item.desconto_percentual}%
                        </td>
                        <td className="px-6 py-3 text-white">
                          R${" "}
                          {item.subtotal.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-6 py-3 text-center">
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* BLOCK 3: QUANTO E COMO? */}
          <div className="bg-primary rounded-lg border  p-6 space-y-6 h-fit">
            <h2 className="text-lg font-bold text-white">
              Block 3: Quanto e Como?
            </h2>

            <div className="space-y-3 border-b border-white/10 pb-4">
              <h3 className="text-sm font-bold text-white">Resumo de Valores</h3>

              <div className="flex justify-between items-center">
                <span className="text-white/60">Subtotal:</span>
                <span className="text-white font-semibold">
                  R${" "}
                  {subtotal.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-white/60">Desconto Total:</span>
                <span className="text-white font-semibold">
                  R${" "}
                  {desconto.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-white/60">Frete:</span>
                <span className="text-white font-semibold">
                  R${" "}
                  {frete.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-white/10 p-4 rounded-lg">
              <span className="text-white font-bold">Total Final:</span>
              <span className="text-2xl font-bold text-green-400">
                R${" "}
                {total.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-white/60 text-xs font-medium">
                Condição de Pagamento:
              </label>
              <select
                value={condicaoPagamento.id}
                onChange={(e) => {
                  const condicao = condicoesPagamentoData.find(
                    (c) => c.id === e.target.value
                  );
                  if (condicao) setCondicaoPagamento(condicao);
                }}
                className="w-full bg-primary border border-white/10 text-white rounded-md px-3 py-2 focus:outline-none focus:border-cyan-400"
              >
                {condicoesPagamentoData.map((condicao) => (
                  <option key={condicao.id} value={condicao.id}>
                    {condicao.descricao}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-lg h-11 rounded-lg">
                Finalizar Venda
              </Button>

              <Button className="w-full border-2 border-green-500 bg-transparent text-green-400 hover:bg-green-500/10 font-bold h-11 rounded-lg">
                Salvar Orçamento
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
