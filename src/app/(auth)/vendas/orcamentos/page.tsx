"use client";

import {
  Plus, Search, Calendar,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileText,
} from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";
import { orcamentosData, Orcamento } from "@/lib/data/orcamentos";
import { OrcamentoItem } from "@/components/vendas/orcamento-item";
import { ModalExclusaoOrcamento } from "@/components/vendas/modal-exclusao-orcamento";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

function parseDate(str: string): Date {
  const [d, m, y] = str.split("/");
  return new Date(`${y}-${m}-${d}`);
}

export default function OrcamentosPage() {
  const [data, setData]             = useState<Orcamento[]>(orcamentosData);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm]   = useState("");
  const [dateStart, setDateStart]     = useState("");
  const [dateEnd, setDateEnd]         = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [modalOpen,        setModalOpen]        = useState(false);
  const [orcamentoAlvo, setOrcamentoAlvo] = useState<Orcamento | null>(null);

  const itemsPerPage = 8;

  const filteredData = useMemo(() =>
    data.filter((orc) => {
      const matchSearch =
        searchTerm === "" ||
        orc.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orc.numero.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus  = statusFilter === "" || orc.status === statusFilter;
      const orcDate      = parseDate(orc.data);
      const matchStart   = dateStart === "" || orcDate >= new Date(dateStart);
      const matchEnd     = dateEnd   === "" || orcDate <= new Date(dateEnd);
      return matchSearch && matchStatus && matchStart && matchEnd;
    }),
    [data, searchTerm, statusFilter, dateStart, dateEnd]
  );

  const totalPages    = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const safePage      = Math.min(currentPage, totalPages);
  const paginatedData = filteredData.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  );

  const handleDeleteRequest = (orcamento: Orcamento) => {
    setOrcamentoAlvo(orcamento);
    setModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!orcamentoAlvo) return;
    setData(prev => prev.filter(o => o.id !== orcamentoAlvo.id));
    setOrcamentoAlvo(null);
  };

  const resetFilters = () => {
    setSearchTerm(""); setStatusFilter("");
    setDateStart("");  setDateEnd("");
    setCurrentPage(1);
  };

  return (
    <div className="w-full min-h-screen bg-secondary p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">Vendas</p>
            <h1 className="text-3xl font-black text-white tracking-tighter">Orçamentos</h1>
          </div>
          <Link href="/vendas/orcamentos/novo">
            <Button className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-full px-5 transition-all hover:scale-105 active:scale-95">
              <Plus className="mr-2 h-4 w-4" />
              Novo Orçamento
            </Button>
          </Link>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-primary p-4 rounded-2xl border border-white/5">
          <div className="md:col-span-1 space-y-1.5">
            <label className="text-white/50 text-xs font-medium block">Cliente / Nº orçamento</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-8 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-cyan-500/50 h-9 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-white/50 text-xs font-medium block">Data início</label>
            <div className="relative">
              <Input type="date" value={dateStart}
                onChange={(e) => { setDateStart(e.target.value); setCurrentPage(1); }}
                className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50 h-9 text-sm pr-9"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-white/50 text-xs font-medium block">Data fim</label>
            <div className="relative">
              <Input type="date" value={dateEnd}
                onChange={(e) => { setDateEnd(e.target.value); setCurrentPage(1); }}
                className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50 h-9 text-sm pr-9"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-white/50 text-xs font-medium block">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 h-9 px-3 rounded-md focus:outline-none text-sm"
            >
              <option value="">Todos</option>
              <option value="Aberto">Aberto</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Recusado">Recusado</option>
              <option value="Expirado">Expirado</option>
            </select>
          </div>
        </div>

        {/* Tabela */}
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-primary">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/10 hover:bg-transparent bg-white/5">
                {["Nº Orçamento", "Data", "Validade", "Cliente", "Valor Total", "Status", "Ações"].map((h) => (
                  <TableHead
                    key={h}
                    className={`text-white/50 font-semibold text-xs uppercase tracking-wider ${h === "Valor Total" ? "text-right" : ""} ${h === "Ações" ? "text-center" : ""}`}
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white/20" />
                      </div>
                      <p className="text-white/40 text-sm">Nenhum orçamento encontrado</p>
                      {(searchTerm || statusFilter || dateStart || dateEnd) && (
                        <button onClick={resetFilters} className="text-cyan-400 text-xs hover:underline">
                          Limpar filtros
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((orc) => (
                  <OrcamentoItem
                    key={orc.id}
                    data={orc}
                    onDelete={handleDeleteRequest}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Rodapé */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            {filteredData.length === 0
              ? "Nenhum resultado"
              : `Exibindo ${(safePage - 1) * itemsPerPage + 1}–${Math.min(safePage * itemsPerPage, filteredData.length)} de ${filteredData.length} orçamentos`}
          </p>
          <div className="flex items-center gap-1.5">
            {[
              { icon: <ChevronsLeft className="h-4 w-4" />, action: () => setCurrentPage(1),           disabled: safePage === 1 },
              { icon: <ChevronLeft  className="h-4 w-4" />, action: () => setCurrentPage(p => p - 1),  disabled: safePage === 1 },
              { icon: <ChevronRight className="h-4 w-4" />, action: () => setCurrentPage(p => p + 1),  disabled: safePage === totalPages },
              { icon: <ChevronsRight className="h-4 w-4" />, action: () => setCurrentPage(totalPages), disabled: safePage === totalPages },
            ].map((btn, i) =>
              i === 2
                ? [
                    <div key="indicator" className="px-4 h-9 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-medium flex items-center gap-1">
                      <span>{safePage}</span>
                      <span className="text-white/30">/</span>
                      <span className="text-white/40">{totalPages}</span>
                    </div>,
                    <button key={i} onClick={btn.action} disabled={btn.disabled}
                      className="w-9 h-9 rounded-lg border border-white/15 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center">
                      {btn.icon}
                    </button>,
                  ]
                : (
                  <button key={i} onClick={btn.action} disabled={btn.disabled}
                    className="w-9 h-9 rounded-lg border border-white/15 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center">
                    {btn.icon}
                  </button>
                )
            )}
          </div>
        </div>

      </div>

      {/* Modal de exclusão */}
      <ModalExclusaoOrcamento
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        onConfirm={handleDeleteConfirm}
        orcamento={orcamentoAlvo}
      />
    </div>
  );
}