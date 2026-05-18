"use client";

import {
  Plus,
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import axios from "axios";
import {
  ContaReceber,
  CATEGORIA_RECEBER_LABEL,
  CATEGORIA_RECEBER_OPTIONS,
  STATUS_CONTA_LABEL,
  STATUS_CONTA_RECEBER_OPTIONS,
  formatBRL,
} from "@/lib/data/financeiro";
import {
  listContasReceber,
  deleteContaReceber,
  updateContaReceber,
} from "@/services/contas-receber";
import type { CategoriaReceber, StatusConta } from "@/services/api/enums";
import { ContaReceberItem } from "@/components/financeiro/conta-receber-item";
import { ModalExclusaoConta } from "@/components/financeiro/modal-exclusao-conta";
import { ContaReceberForm } from "./_components/conta-receber-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { extractApiError } from "@/lib/utils/api-errors";
import {
  PeriodoPresets,
  resolveRange,
  type PeriodoPreset,
} from "@/components/ui/periodo-presets";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ITEMS_PER_PAGE = 8;

export default function ContasReceberPage() {
  const [data, setData] = useState<ContaReceber[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [periodo, setPeriodo] = useState<PeriodoPreset>("tudo");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | StatusConta>("");
  const [categoriaFilter, setCategoriaFilter] = useState<"" | CategoriaReceber>(
    ""
  );

  const [formOpen, setFormOpen] = useState(false);
  const [contaEdit, setContaEdit] = useState<ContaReceber | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [contaAlvo, setContaAlvo] = useState<ContaReceber | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [markingReceivedId, setMarkingReceivedId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { from: rangeFrom, to: rangeTo } = useMemo(
    () => resolveRange(periodo, dateStart, dateEnd),
    [periodo, dateStart, dateEnd]
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await listContasReceber({
        limit: 200,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter && { status: statusFilter }),
        ...(categoriaFilter && { categoria: categoriaFilter }),
        ...(rangeFrom && { vencimentoFrom: rangeFrom }),
        ...(rangeTo && { vencimentoTo: rangeTo }),
      });
      setData(res.data);
    } catch (err) {
      setLoadError(extractApiError(err, "Erro ao carregar contas a receber."));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, categoriaFilter, rangeFrom, rangeTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.max(1, Math.ceil(data.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedData = data.slice(
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
      const valor = Number(c.valor);
      const vencimento = c.vencimento.split("T")[0];
      if (c.status === "PENDENTE") totalPendente += valor;
      if (c.status === "ATRASADO") totalAtrasado += valor;
      if (
        c.status === "PENDENTE" &&
        vencimento >= hoje &&
        vencimento <= limite7
      ) {
        totalProx7 += valor;
      }
      if (c.status === "RECEBIDO" && c.dataRecebimento?.startsWith(mesAtual)) {
        recebidoNoMes += valor;
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

  const handleDeleteRequest = (conta: ContaReceber) => {
    setContaAlvo(conta);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!contaAlvo) return;
    setIsDeleting(true);
    try {
      await deleteContaReceber(contaAlvo.id);
      setContaAlvo(null);
      setDeleteOpen(false);
      fetchData();
    } catch (err) {
      setLoadError(extractApiError(err, "Erro ao excluir conta."));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkReceived = async (conta: ContaReceber) => {
    setMarkingReceivedId(conta.id);
    try {
      await updateContaReceber(conta.id, {
        status: "RECEBIDO",
        dataRecebimento: new Date().toISOString().slice(0, 10),
      });
      fetchData();
    } catch (err) {
      setLoadError(extractApiError(err, "Erro ao marcar como recebido."));
    } finally {
      setMarkingReceivedId(null);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setCategoriaFilter("");
    setPeriodo("tudo");
    setDateStart("");
    setDateEnd("");
    setCurrentPage(1);
  };

  const hasFilters =
    searchTerm || statusFilter || categoriaFilter || periodo !== "tudo";

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
            className="bg-green-500 hover:bg-green-400 text-white font-bold rounded-full px-5 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Conta
          </Button>
        </div>

        {/* Erro */}
        {loadError && (
          <div className="flex flex-wrap items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="flex-1 text-red-400 text-sm font-medium">{loadError}</p>
            <button
              onClick={fetchData}
              className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-1"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Tentar novamente
            </button>
            <button
              onClick={() => setLoadError(null)}
              className="text-red-400/60 hover:text-red-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

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
            icon={<TrendingUp className="w-5 h-5 text-green-400" />}
            bg="bg-green-500/10"
            textColor="text-green-400"
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
        <div className="bg-primary p-4 rounded-2xl border border-white/5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-white/50 text-xs font-medium block">
                Descrição / Cliente
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-green-500/50 h-9 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-white/50 text-xs font-medium block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as "" | StatusConta);
                  setCurrentPage(1);
                }}
                className="w-full bg-white/5 border border-white/10 text-white focus:border-green-500/50 h-9 px-3 rounded-md focus:outline-none text-sm"
              >
                <option value="">Todos</option>
                {STATUS_CONTA_RECEBER_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_CONTA_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-white/50 text-xs font-medium block">
                Categoria
              </label>
              <select
                value={categoriaFilter}
                onChange={(e) => {
                  setCategoriaFilter(e.target.value as "" | CategoriaReceber);
                  setCurrentPage(1);
                }}
                className="w-full bg-white/5 border border-white/10 text-white focus:border-green-500/50 h-9 px-3 rounded-md focus:outline-none text-sm"
              >
                <option value="">Todas</option>
                {CATEGORIA_RECEBER_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORIA_RECEBER_LABEL[c]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-1">
            <label className="text-white/50 text-xs font-medium block mb-2">
              Vencimento
            </label>
            <PeriodoPresets
              preset={periodo}
              dateStart={dateStart}
              dateEnd={dateEnd}
              onPresetChange={(p) => {
                setPeriodo(p);
                setCurrentPage(1);
              }}
              onCustomDateChange={(field, value) => {
                if (field === "start") setDateStart(value);
                else setDateEnd(value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Tabela */}
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-primary">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/10 hover:bg-transparent bg-white/5">
                {[
                  "Descrição",
                  "Cliente",
                  "Categoria",
                  "Vencimento",
                  "Valor",
                  "Status",
                  "Ações",
                ].map((h) => (
                  <TableHead
                    key={h}
                    className={`text-white/50 font-semibold text-xs uppercase tracking-wider ${
                      h === "Valor" ? "text-right" : ""
                    } ${h === "Ações" ? "text-center" : ""}`}
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeleton columns={7} />
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white/20" />
                      </div>
                      <p className="text-white/40 text-sm">
                        {hasFilters
                          ? "Nenhuma conta encontrada com esses filtros"
                          : "Nenhuma conta a receber cadastrada"}
                      </p>
                      {hasFilters && (
                        <button
                          onClick={resetFilters}
                          className="text-green-400 text-xs hover:underline"
                        >
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
                    isMarkingReceived={markingReceivedId === c.id}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Rodapé */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            {data.length === 0
              ? "Nenhum resultado"
              : `Exibindo ${(safePage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(
                  safePage * ITEMS_PER_PAGE,
                  data.length
                )} de ${data.length} contas`}
          </p>
          <div className="flex items-center gap-1.5">
            <PagBtn
              icon={<ChevronsLeft className="h-4 w-4" />}
              onClick={() => setCurrentPage(1)}
              disabled={safePage === 1}
            />
            <PagBtn
              icon={<ChevronLeft className="h-4 w-4" />}
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={safePage === 1}
            />
            <div className="px-4 h-9 rounded-lg border border-green-500/30 bg-green-500/10 text-green-400 text-sm font-medium flex items-center gap-1">
              <span>{safePage}</span>
              <span className="text-white/30">/</span>
              <span className="text-white/40">{totalPages}</span>
            </div>
            <PagBtn
              icon={<ChevronRight className="h-4 w-4" />}
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={safePage === totalPages}
            />
            <PagBtn
              icon={<ChevronsRight className="h-4 w-4" />}
              onClick={() => setCurrentPage(totalPages)}
              disabled={safePage === totalPages}
            />
          </div>
        </div>
      </div>

      <ContaReceberForm
        isOpen={formOpen}
        onOpenChange={setFormOpen}
        onSaved={fetchData}
        conta={contaEdit}
      />

      <ModalExclusaoConta
        isOpen={deleteOpen}
        onOpenChange={(open) => {
          if (!isDeleting) setDeleteOpen(open);
        }}
        onConfirm={handleDeleteConfirm}
        conta={contaAlvo}
        tipo="receber"
        isDeleting={isDeleting}
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
      <div className={`${bg} rounded-xl p-3 flex-shrink-0`}>{icon}</div>
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
      className="w-9 h-9 rounded-lg border border-white/15 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
    >
      {icon}
    </button>
  );
}
