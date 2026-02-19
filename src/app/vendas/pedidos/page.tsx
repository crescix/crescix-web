"use client";

import { Plus, Search, Filter, Calendar, Printer, Pencil } from "lucide-react";
import { pedidosData, Pedido } from "@/lib/data/vendas";
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
import Link from "next/link";
import { useState } from "react";

export default function PedidosPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const paginatedData = pedidosData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(pedidosData.length / itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Faturado":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Pendente":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Orçamento":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "Cancelado":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-white/10 text-white/60 border-white/20";
    }
  };

  return (
    <div className="w-full bg-secondary p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
              Histórico de Pedidos
            </h1>
          </div>

          <Link href="/vendas/pedidos/novo">
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all hover:scale-105">
              <Plus className="mr-2 h-5 w-5" />
              Novo Pedido
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4  bg-primary p-4 rounded-2xl">
          <div className="md:col-span-1">
            <label className="text-white/60 text-xs font-medium mb-2 block">
              Cliente:
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Buscar por Cliente/Nº pedido"
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-400 h-9"
              />
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="text-white/60 text-xs font-medium mb-2 block">
              *Data de Início
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Data Início"
                className="pl-3 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan h-9"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="text-white/60 text-xs font-medium mb-2 block">
              *Data de Fim
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Data Fim"
                className="pl-3 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan h-9"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="text-white/60 text-xs font-medium mb-2 block">
              *Status
            </label>
            <select className="w-full bg-primary border border-white/10 text-white placeholder:text-white/30 focus:border-cyan-400 h-9 px-3 rounded-md focus:outline-none focus:ring-0">
              <option value="">Status</option>
              <option value="Faturado">Faturado</option>
              <option value="Pendente">Pendente</option>
              <option value="Orçamento">Orçamento</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 overflow-hidden bg-primary shadow-lg">
          <Table>
            <TableHeader className="bg-white/5 border-b border-white/10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-white/60 font-semibold">
                  Nº Pedido
                </TableHead>
                <TableHead className="text-white/60 font-semibold">
                  Data
                </TableHead>
                <TableHead className="text-white/60 font-semibold">
                  Cliente
                </TableHead>
                <TableHead className="text-white/60 font-semibold">
                  Valor Total
                </TableHead>
                <TableHead className="text-white/60 font-semibold">
                  Status
                </TableHead>
                <TableHead className="text-white/60 font-semibold text-center">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((pedido) => (
                <TableRow
                  key={pedido.id}
                  className="border-b border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 text-white font-medium">
                    {pedido.numero}
                  </td>
                  <td className="px-6 py-4 text-white">{pedido.data}</td>
                  <td className="px-6 py-4 text-white">{pedido.cliente}</td>
                  <td className="px-6 py-4 text-white">
                    R$ {pedido.valor_total.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      className={`${getStatusColor(pedido.status)} border`}
                    >
                      {pedido.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <Printer className="h-4 w-4 text-white/60 hover:text-white" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <Pencil className="h-4 w-4 text-white/60 hover:text-white" />
                    </button>
                  </td>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 2))}
            className="w-10 h-10 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors flex items-center justify-center"
          >
            ⟨⟨
          </button>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="w-10 h-10 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors flex items-center justify-center"
          >
            ⟨
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            className="w-10 h-10 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors flex items-center justify-center"
          >
            ⟩
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 2))}
            className="w-10 h-10 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors flex items-center justify-center"
          >
            ⟩⟩
          </button>
        </div>
      </div>
    </div>
  );
}
