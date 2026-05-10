"use client"

import { DataTable } from "./data-table"
import { columns } from "./columns"
import { transactions } from "@/lib/data/fluxo-caixa"
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, TrendingDown } from "lucide-react"

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
    <div className="w-full min-h-screen bg-secondary p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-7xl space-y-6">

        {/* Header */}
        <div>
          <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-1">
            Financeiro
          </p>
          <h1 className="text-3xl font-black text-white tracking-tighter">
            Fluxo de Caixa
          </h1>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Entradas */}
          <div className="bg-primary rounded-2xl border border-white/10 p-5 flex items-center gap-4">
            <div className="bg-green-500/10 rounded-xl p-3 flex-shrink-0">
              <ArrowUpRight className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-white/40 font-medium">Total de Entradas</p>
              <p className="text-lg font-bold text-green-400 mt-0.5">{fmt(entradas)}</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-green-400/60">
                <TrendingUp className="w-3 h-3" />
                Receitas do período
              </div>
            </div>
          </div>

          {/* Saídas */}
          <div className="bg-primary rounded-2xl border border-white/10 p-5 flex items-center gap-4">
            <div className="bg-red-500/10 rounded-xl p-3 flex-shrink-0">
              <ArrowDownRight className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-white/40 font-medium">Total de Saídas</p>
              <p className="text-lg font-bold text-red-400 mt-0.5">{fmt(saidas)}</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-red-400/60">
                <TrendingDown className="w-3 h-3" />
                Despesas do período
              </div>
            </div>
          </div>

          {/* Saldo */}
          <div className={`rounded-2xl border p-5 flex items-center gap-4 bg-primary ${
            saldo >= 0 ? "border-cyan-500/20" : "border-red-500/20"
          }`}>
            <div className={`rounded-xl p-3 flex-shrink-0 ${saldo >= 0 ? "bg-cyan-500/10" : "bg-red-500/10"}`}>
              <Wallet className={`w-5 h-5 ${saldo >= 0 ? "text-cyan-400" : "text-red-400"}`} />
            </div>
            <div>
              <p className="text-xs text-white/40 font-medium">Saldo Líquido</p>
              <p className={`text-lg font-bold mt-0.5 ${saldo >= 0 ? "text-cyan-400" : "text-red-400"}`}>
                {saldo >= 0 ? "" : "-"}{fmt(Math.abs(saldo))}
              </p>
              <p className={`text-xs mt-1 ${saldo >= 0 ? "text-cyan-400/60" : "text-red-400/60"}`}>
                {saldo >= 0 ? "Resultado positivo" : "Resultado negativo"}
              </p>
            </div>
          </div>

        </div>

        {/* Tabela */}
        <div className="bg-primary rounded-2xl border border-white/10 p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">
              ↕
            </span>
            <div>
              <h2 className="text-sm font-bold text-white">Histórico de Transações</h2>
              <p className="text-xs text-white/30 mt-0.5">{transactions.length} transações registradas</p>
            </div>
          </div>
          <DataTable columns={columns} data={transactions} />
        </div>

      </div>
    </div>
  )
}