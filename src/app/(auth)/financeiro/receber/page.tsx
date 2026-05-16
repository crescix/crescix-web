"use client";

import {
  Plus, Search, Calendar, FileText,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  TrendingUp, AlertCircle, Clock, CheckCircle2,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import {
  ContaReceber,
  CATEGORIAS_RECEBER,
  getContasReceber,
  setContasReceber,
  formatBRL,
} from "@/lib/data/financeiro";
import { ContaReceberItem } from "@/components/financeiro/conta-receber-item";
import { ModalExclusaoConta } from "@/components/financeiro/modal-exclusao-conta";
import { ContaReceberForm } from "./_components/conta-receber-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const ITEMS_PER_PAGE = 8;

export default function ContasReceberPage() {
  const [data, setData] = useState<ContaReceber[]>([]);
  const [mounted, setMounted] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [contaEdit, setContaEdit] = useState<ContaReceber | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [contaAlvo, setContaAlvo] = useState<ContaReceber | null>(null);

  useEffect(() => {
    setData(getContasReceber());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) setContasReceber(data);
  }, [data, mounted]);

  const filteredData = useMemo(() =>
    data.filter((c) => {
      const matchSearch =
        searchTerm === "" ||
        c.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchStatus = statusFilter === "" || c.status === statusFilter;
      const matchCategoria = categoriaFilter === "" || c.categoria === categoriaFilter;
      const matchStart = dateStart === "" || c.vencimento >= dateStart;
      const matchEnd = dateEnd === "" || c.vencimento <= dateEnd;
      return matchSearch && matchStatus && matchCategoria && matchStart && matchEnd;
    }),
    [data, searchTerm, statusFilter, categoriaFilter, dateStart, dateEnd]
  );

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedData = filteredData.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const resumo = useMemo(() => {
    const hoje = new Date().toISOString().slice(0, 10);
    const em7Dias = new Date();
    em7Dias.setDate(em7Dias.getDate() + 7);
    const limite7 = em7Dias.toISOString().slice(0, 10);

    const mesAtual = hoje.slice(0, 7);

    let totalPendente = 0;
    let totalAtrasado = 0;
    let totalProx7 = 0;
    let recebidoNoMes = 0;

    for (const c of data) {
      if (c.status === "Pendente") totalPendente += c.valor;
      if (c.status === "Atrasado") totalAtrasado += c.valor;
      if (c.status === "Pendente" && c.vencimento >= hoje && c.vencimento <= limite7) {
        totalProx7 += c.valor;
      }
      if (c.status === "Recebido" && c.data_recebimento?.startsWith(mesAtual)) {
        recebidoNoMes += c.valor;
      }
    }

    return { totalPendente, totalAtrasado, totalProx7, recebidoNoMes };
  }, [data]);

  const handleNovo = () => {
    setContaEdit(null);
    setFormOpen(true);
  };

  const handleEdit = (conta: ContaReceber) => {
    setContaEdit(conta);
    setFormOpen(true);
  };

  const handleSubmit = (conta: ContaReceber) => {
    setData((prev) => {
      const exists = prev.some((c) => c.id === conta.id);
      return exists
        ? prev.map((c) => (c.id === conta.id ? conta : c))
        : [conta, ...prev];
    });
  };

  const handleDeleteRequest = (conta: ContaReceber) => {
    setContaAlvo(conta);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!contaAlvo) return;
    setData((prev) => prev.filter((c) => c.id !== contaAlvo.id));
    setContaAlvo(null);
  };

  const handleMarkReceived = (conta: ContaReceber) => {
    const hoje = new Date().toISOString().slice(0, 10);
    setData((prev) =>
      prev.map((c) =>
        c.id === conta.id
          ? { ...c, status: "Recebido", data_recebimento: hoje }
          : c
      )
    );
  };

  const resetFilters = () => {
    setSearchTerm(""); setStatusFilter("");
    setCategoriaFilter(""); setDateStart(""); setDateEnd("");
    setCurrentPage(1);
  };

  const hasFilters =
    searchTerm || statusFilter || categoriaFilter || dateStart || dateEnd;

  return (
    <div className="w-full min-h-screen bg-secondary p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">
              Financeiro
            </p>
            <h1 className="text-3xl font-black text-white tracking-tighter">
              Contas a Receber
            </h1>
          </div>
          <Button
            onClick={handleNovo}
            className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-full px-5 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Conta
          </Button>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ResumoCard
            label="Total Pendente"
            value={formatBRL(resumo.totalPendente)}
            icon={<Clock className="w-5 h-5 text-amber-400" />}
            bg="bg-amber-500/10"
            textColor="text-amber-400"
          />
          <ResumoCard
            label="Vencidas"
            value={formatBRL(resumo.totalAtrasado)}
            icon={<AlertCircle className="w-5 h-5 text-red-400" />}
            bg="bg-red-500/10"
            textColor="text-red-400"
          />
          <ResumoCard
            label="Próximos 7 dias"
            value={formatBRL(resumo.totalProx7)}
            icon={<TrendingUp className="w-5 h-5 text-cyan-400" />}
            bg="bg-cyan-500/10"
            textColor="text-cyan-400"
          />
          <ResumoCard
            label="Recebido no mês"
            value={formatBRL(resumo.recebidoNoMes)}
            icon={<CheckCircle2 className="w-5 h-5 text-green-400" />}
            bg="bg-green-500/10"
            textColor="text-green-400"
          />
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-primary p-4 rounded-2xl border border-white/5">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-white/50 text-xs font-medium block">
              Descrição / Cliente
            </label>
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
            <label className="text-white/50 text-xs font-medium block">Vencimento de</label>
            <div className="relative">
              <Input
                type="date"
                value={dateStart}
                onChange={(e) => { setDateStart(e.target.value); setCurrentPage(1); }}
                className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50 h-9 text-sm pr-9"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-white/50 text-xs font-medium block">Até</label>
            <div className="relative">
              <Input
                type="date"
                value={dateEnd}
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
              <option value="Pendente">Pendente</option>
              <option value="Recebido">Recebido</option>
              <option value="Atrasado">Atrasado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          <div className="md:col-span-5 lg:col-span-1 space-y-1.5 lg:col-start-5">
            <label className="text-white/50 text-xs font-medium block">Categoria</label>
            <select
              value={categoriaFilter}
              onChange={(e) => { setCategoriaFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 h-9 px-3 rounded-md focus:outline-none text-sm"
            >
              <option value="">Todas</option>
              {CATEGORIAS_RECEBER.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabela */}
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-primary">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/10 hover:bg-transparent bg-white/5">
                {["Descrição", "Cliente", "Categoria", "Vencimento", "Valor", "Status", "Ações"].map((h) => (
                  <TableHead
                    key={h}
                    className={`text-white/50 font-semibold text-xs uppercase tracking-wider ${h === "Valor" ? "text-right" : ""} ${h === "Ações" ? "text-center" : ""}`}
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {!mounted ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-white/40 text-sm">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white/20" />
                      </div>
                      <p className="text-white/40 text-sm">Nenhuma conta encontrada</p>
                      {hasFilters && (
                        <button onClick={resetFilters} className="text-cyan-400 text-xs hover:underline">
                          Limpar filtros
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((c) => (
                  <ContaReceberItem
                    key={c.id}
                    data={c}
                    onEdit={handleEdit}
                    onDelete={handleDeleteRequest}
                    onMarkReceived={handleMarkReceived}
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
              : `Exibindo ${(safePage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(safePage * ITEMS_PER_PAGE, filteredData.length)} de ${filteredData.length} contas`}
          </p>
          <div className="flex items-center gap-1.5">
            <PagBtn icon={<ChevronsLeft className="h-4 w-4" />} onClick={() => setCurrentPage(1)} disabled={safePage === 1} />
            <PagBtn icon={<ChevronLeft className="h-4 w-4" />} onClick={() => setCurrentPage((p) => p - 1)} disabled={safePage === 1} />
            <div className="px-4 h-9 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-medium flex items-center gap-1">
              <span>{safePage}</span>
              <span className="text-white/30">/</span>
              <span className="text-white/40">{totalPages}</span>
            </div>
            <PagBtn icon={<ChevronRight className="h-4 w-4" />} onClick={() => setCurrentPage((p) => p + 1)} disabled={safePage === totalPages} />
            <PagBtn icon={<ChevronsRight className="h-4 w-4" />} onClick={() => setCurrentPage(totalPages)} disabled={safePage === totalPages} />
          </div>
        </div>

      </div>

      <ContaReceberForm
        isOpen={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        conta={contaEdit}
      />

      <ModalExclusaoConta
        isOpen={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        conta={contaAlvo}
        tipo="receber"
      />
    </div>
  );
}

interface ResumoCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  bg: string;
  textColor: string;
}

function ResumoCard({ label, value, icon, bg, textColor }: ResumoCardProps) {
  return (
    <div className="bg-primary rounded-2xl border border-white/10 p-5 flex items-center gap-4">
      <div className={`${bg} rounded-xl p-3 flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-white/40 font-medium">{label}</p>
        <p className={`text-lg font-bold mt-0.5 truncate ${textColor}`}>{value}</p>
      </div>
    </div>
  );
}

interface PagBtnProps {
  icon: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
}

function PagBtn({ icon, onClick, disabled }: PagBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-9 h-9 rounded-lg border border-white/15 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center">
      {icon}
    </button>
  );
}
