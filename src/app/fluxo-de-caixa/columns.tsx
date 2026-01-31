"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Transaction } from "@/lib/data/fluxo-caixa"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "vencimento",
    header: "Vencimento",
    cell: ({ row }) => {
      const date = new Date(row.getValue("vencimento"))
      return date.toLocaleDateString("pt-BR")
    },
  },
  {
    accessorKey: "descricao",
    header: "Descrição",
  },
  {
    accessorKey: "categoria",
    header: "Categoria",
  },
  {
    accessorKey: "valor",
    header: "Valor",
    cell: ({ row }) => {
      const valor = parseFloat(row.getValue("valor"))
      const formatado = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(valor)

      return (
        <span className={valor >= 0 ? "text-green-600  bg-green-100 p-1 rounded font-bold" : "text-red-600 bg-red-100 p-1 rounded font-bold"}>
          {valor >= 0 ? `+ ${formatado}` : formatado}
        </span>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge 
          className={
            status === "pago" ? "bg-green-100 text-green-800 hover:bg-green-100 border-none" : 
            status === "aberto" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none" : 
            "bg-red-100 text-red-800 hover:bg-red-100 border-none"
          }
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      )
    },
  },
]