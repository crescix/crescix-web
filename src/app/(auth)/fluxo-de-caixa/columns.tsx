"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Transaction } from "@/lib/data/fluxo-caixa"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

const statusStyle: Record<string, string> = {
  pago:      "bg-emerald-100 text-emerald-700",
  aberto:    "bg-amber-100 text-amber-700",
  cancelado: "bg-rose-100 text-rose-700",
}

const statusLabel: Record<string, string> = {
  pago:      "Pago",
  aberto:    "Aberto",
  cancelado: "Cancelado",
}

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "vencimento",
    header: "Vencimento",
    cell: ({ row }) => {
      const date = new Date(row.getValue("vencimento"))
      return (
        <span className="text-gray-500 text-sm">
          {date.toLocaleDateString("pt-BR")}
        </span>
      )
    },
  },
  {
    accessorKey: "descricao",
    header: "Descrição",
    cell: ({ row }) => (
      <span className="font-medium text-gray-700 text-sm">
        {row.getValue("descricao")}
      </span>
    ),
  },
  {
    accessorKey: "categoria",
    header: "Categoria",
    cell: ({ row }) => (
      <span className="text-gray-500 text-sm">
        {row.getValue("categoria")}
      </span>
    ),
  },
  {
    accessorKey: "valor",
    header: "Valor",
    cell: ({ row }) => {
      const valor = parseFloat(row.getValue("valor"))
      const formatado = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(Math.abs(valor))

      const isPositive = valor >= 0
      return (
        <div className={`inline-flex items-center gap-1 text-sm font-semibold ${
          isPositive ? "text-emerald-600" : "text-rose-600"
        }`}>
          {isPositive
            ? <ArrowUpRight className="w-3.5 h-3.5" />
            : <ArrowDownRight className="w-3.5 h-3.5" />
          }
          {isPositive ? "+ " : "- "}{formatado}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = (row.getValue("status") as string).toLowerCase()
      return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          statusStyle[status] ?? "bg-gray-100 text-gray-600"
        }`}>
          {statusLabel[status] ?? status}
        </span>
      )
    },
  },
]
