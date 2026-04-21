"use client"

import { DataTable } from "./data-table"
import { columns } from "./columns"
import { transactions } from "@/lib/data/fluxo-caixa"
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
} from "lucide-react"

export default function FluxoDeCaixa() {
  const entradas = transactions
    .filter((t) => t.tipo === "receita")
    .reduce((acc, t) => acc + t.valor, 0)

  const saidas = transactions
    .filter((t) => t.tipo === "despesa")
    .reduce((acc, t) => acc + Math.abs(t.valor), 0)

  const saldo = entradas - saidas

  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)

  return (
    <div className="min-h-screen w-full bg-transparent py-6">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black tracking-tight">
              Fluxo de Caixa
            </h1>
            <p className="text-lg text-gray-800 mt-0.5">
              Acompanhe entradas e saídas do seu negócio
            </p>
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Entradas */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="bg-emerald-50 rounded-xl p-3 flex-shrink-0">
              <ArrowUpRight className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Total de Entradas</p>
              <p className="text-lg font-bold text-emerald-600 mt-0.5">{fmt(entradas)}</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-emerald-500">
                <TrendingUp className="w-3 h-3" />
                Receitas do período
              </div>
            </div>
          </div>

          {/* Saídas */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="bg-rose-50 rounded-xl p-3 flex-shrink-0">
              <ArrowDownRight className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Total de Saídas</p>
              <p className="text-lg font-bold text-rose-600 mt-0.5">{fmt(saidas)}</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-rose-500">
                <TrendingDown className="w-3 h-3" />
                Despesas do período
              </div>
            </div>
          </div>

          {/* Saldo */}
          <div className={`rounded-2xl p-5 border shadow-sm flex items-center gap-4 ${
            saldo >= 0
              ? "bg-teal-600 border-teal-600"
              : "bg-rose-600 border-rose-600"
          }`}>
            <div className="bg-white/20 rounded-xl p-3 flex-shrink-0">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-white/70 font-medium">Saldo Líquido</p>
              <p className="text-lg font-bold text-white mt-0.5">
                {saldo >= 0 ? "" : "-"}{fmt(Math.abs(saldo))}
              </p>
              <p className="text-xs text-white/60 mt-1">
                {saldo >= 0 ? "Resultado positivo" : "Resultado negativo"}
              </p>
            </div>
          </div>

        </div>

        {/* Tabela */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-gray-700">
              Histórico de Transações
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {transactions.length} transações registradas
            </p>
          </div>
          <DataTable columns={columns} data={transactions} />
        </div>

      </div>
    </div>
  )
}
