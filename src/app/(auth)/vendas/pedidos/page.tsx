"use client";

import { Plus, Search, Calendar, Printer, Pencil, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileText } from "lucide-react";
import { pedidosData, Pedido } from "@/lib/data/vendas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { useState, useMemo } from "react";

const STATUS_STYLES: Record<string, string> = {
  Faturado: "bg-green-500/15 text-green-400 border-green-500/25",
  Pendente: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  Orçamento: "bg-slate-500/15 text-slate-400 border-slate-500/25",
  Cancelado: "bg-red-500/15 text-red-400 border-red-500/25",
};

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

export default function PedidosPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const itemsPerPage = 8;

  const filteredData = useMemo(() => {
    return pedidosData.filter((pedido) => {
      const matchSearch =
        searchTerm === "" ||
        pedido.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pedido.numero.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === "" || pedido.status === statusFilter;

      // Parsing simples de data DD/MM/AAAA para comparação
      const parseDate = (str: string) => {
        const [d, m, y] = str.split("/");
        return new Date(`${y}-${m}-${d}`);
      };
      const pedidoDate = parseDate(pedido.data);
      const matchStart =
        dateStart === "" || pedidoDate >= new Date(dateStart);
      const matchEnd =
        dateEnd === "" || pedidoDate <= new Date(dateEnd);

      return matchSearch && matchStatus && matchStart && matchEnd;
    });
  }, [searchTerm, statusFilter, dateStart, dateEnd]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedData = filteredData.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleDateStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateStart(e.target.value);
    setCurrentPage(1);
  };

  const handleDateEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateEnd(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="w-full min-h-screen bg-secondary p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-1">
              Vendas
            </p>
            <h1 className="text-3xl font-black text-white tracking-tighter">
              Histórico de Pedidos
            </h1>
          </div>
          <Link href="/vendas/pedidos/novo">
            <Button className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-full px-5 transition-all hover:scale-105 active:scale-95">
              <Plus className="mr-2 h-4 w-4" />
              Novo Pedido
            </Button>
          </Link>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-primary p-4 rounded-2xl border border-white/5">
          {/* Busca */}
          <div className="md:col-span-1 space-y-1.5">
            <label className="text-white/50 text-xs font-medium block">
              Cliente / Nº pedido
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-8 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-cyan-500/50 h-9 text-sm"
              />
            </div>
          </div>

          {/* Data início */}
          <div className="space-y-1.5">
            <label className="text-white/50 text-xs font-medium block">
              Data início
            </label>
            <div className="relative">
              <Input
                type="date"
                value={dateStart}
                onChange={handleDateStartChange}
                className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50 h-9 text-sm pr-9"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
            </div>
          </div>

          {/* Data fim */}
          <div className="space-y-1.5">
            <label className="text-white/50 text-xs font-medium block">
              Data fim
            </label>
            <div className="relative">
              <Input
                type="date"
                value={dateEnd}
                onChange={handleDateEndChange}
                className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50 h-9 text-sm pr-9"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-white/50 text-xs font-medium block">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="w-full bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 h-9 px-3 rounded-md focus:outline-none text-sm"
            >
              <option value="">Todos</option>
              <option value="Faturado">Faturado</option>
              <option value="Pendente">Pendente</option>
              <option value="Orçamento">Orçamento</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Tabela */}
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-primary">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/10 hover:bg-transparent bg-white/5">
                <TableHead className="text-white/50 font-semibold text-xs uppercase tracking-wider">
                  Nº Pedido
                </TableHead>
                <TableHead className="text-white/50 font-semibold text-xs uppercase tracking-wider">
                  Data
                </TableHead>
                <TableHead className="text-white/50 font-semibold text-xs uppercase tracking-wider">
                  Cliente
                </TableHead>
                <TableHead className="text-white/50 font-semibold text-xs uppercase tracking-wider text-right">
                  Valor Total
                </TableHead>
                <TableHead className="text-white/50 font-semibold text-xs uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="text-white/50 font-semibold text-xs uppercase tracking-wider text-center">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white/20" />
                      </div>
                      <p className="text-white/40 text-sm">
                        Nenhum pedido encontrado
                      </p>
                      {(searchTerm || statusFilter || dateStart || dateEnd) && (
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("");
                            setDateStart("");
                            setDateEnd("");
                          }}
                          className="text-cyan-400 text-xs hover:underline"
                        >
                          Limpar filtros
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((pedido) => (
                  <TableRow
                    key={pedido.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <TableCell className="text-white font-mono font-medium text-sm">
                      {pedido.numero}
                    </TableCell>
                    <TableCell className="text-white/70 text-sm">
                      {pedido.data}
                    </TableCell>
                    <TableCell className="text-white text-sm font-medium">
                      {pedido.cliente}
                    </TableCell>
                    <TableCell className="text-white text-sm font-semibold text-right">
                      R$ {formatBRL(pedido.valor_total)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${STATUS_STYLES[pedido.status] ?? "bg-white/10 text-white/60 border-white/20"} border text-xs font-medium`}
                      >
                        {pedido.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          title="Imprimir pedido"
                          aria-label="Imprimir pedido"
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                          onClick={() => window.print()}
                        >
                          <Printer className="h-4 w-4 text-white/40 group-hover:text-white transition-colors" />
                        </button>
                        <Link href={`/vendas/pedidos/${pedido.id}/editar`}>
                          <button
                            title="Editar pedido"
                            aria-label="Editar pedido"
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                          >
                            <Pencil className="h-4 w-4 text-white/40 group-hover:text-cyan-400 transition-colors" />
                          </button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Rodapé: contagem + paginação */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            {filteredData.length === 0
              ? "Nenhum resultado"
              : `Exibindo ${(safePage - 1) * itemsPerPage + 1}–${Math.min(safePage * itemsPerPage, filteredData.length)} de ${filteredData.length} pedidos`}
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={safePage === 1}
              aria-label="Primeira página"
              className="w-9 h-9 rounded-lg border border-white/15 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              aria-label="Página anterior"
              className="w-9 h-9 rounded-lg border border-white/15 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="px-4 h-9 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-medium flex items-center gap-1">
              <span>{safePage}</span>
              <span className="text-white/30">/</span>
              <span className="text-white/40">{totalPages}</span>
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              aria-label="Próxima página"
              className="w-9 h-9 rounded-lg border border-white/15 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={safePage === totalPages}
              aria-label="Última página"
              className="w-9 h-9 rounded-lg border border-white/15 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
