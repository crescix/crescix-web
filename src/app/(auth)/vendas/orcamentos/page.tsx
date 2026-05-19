"use client";

import {
  Plus, Search, FileText, AlertCircle, X,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import axios from "axios";
import {
  Orcamento,
  STATUS_ORCAMENTO_OPTIONS,
  STATUS_ORCAMENTO_LABEL,
} from "@/lib/data/orcamentos";
import { listOrcamentos, deleteOrcamento } from "@/services/orcamentos";
import type { StatusOrcamento } from "@/services/api/enums";
import { OrcamentoItem } from "@/components/vendas/orcamento-item";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { extractApiError } from "@/lib/utils/api-errors";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { isoToDisplay } from "@/lib/data/orcamentos";
import {
  PeriodoPresets,
  resolveRange,
  type PeriodoPreset,
} from "@/components/ui/periodo-presets";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const ITEMS_PER_PAGE = 8;

export default function OrcamentosPage() {
  const [data, setData] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [periodo, setPeriodo] = useState<PeriodoPreset>("tudo");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | StatusOrcamento>("");

  const { from: rangeFrom, to: rangeTo } = useMemo(
    () => resolveRange(periodo, dateStart, dateEnd),
    [periodo, dateStart, dateEnd]
  );

  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [orcamentoAlvo, setOrcamentoAlvo] = useState<Orcamento | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const doFetch = useCallback(
    async (search: string, status: "" | StatusOrcamento) => {
      setError(null);
      try {
        const result = await listOrcamentos({
          limit: 100,
          ...(search.trim() && { search: search.trim() }),
          ...(status && { status }),
        });
        setData(result.data);
      } catch (err) {
        setError(extractApiError(err, "Não consegui carregar a lista agora."));
      }
    },
    []
  );

  useEffect(() => {
    setLoading(true);
    doFetch("", "").finally(() => setLoading(false));
  }, [doFetch]);

  useEffect(() => {
    if (loading) return;
    const h = setTimeout(() => doFetch(searchTerm, statusFilter), 300);
    return () => clearTimeout(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter]);

  const filteredData = useMemo(
    () =>
      data.filter((orc) => {
        const orcDate = orc.data.split("T")[0];
        const matchStart = rangeFrom === "" || orcDate >= rangeFrom;
        const matchEnd = rangeTo === "" || orcDate <= rangeTo;
        return matchStart && matchEnd;
      }),
    [data, rangeFrom, rangeTo]
  );

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedData = filteredData.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const handleDeleteRequest = (orcamento: Orcamento) => {
    setOrcamentoAlvo(orcamento);
    setModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!orcamentoAlvo) return;
    setIsDeleting(true);
    try {
      await deleteOrcamento(orcamentoAlvo.id);
      setData((prev) => prev.filter((o) => o.id !== orcamentoAlvo.id));
      setOrcamentoAlvo(null);
      setModalOpen(false);
    } catch (err) {
      setError(extractApiError(err, "Não consegui excluir agora. Tente novamente."));
    } finally {
      setIsDeleting(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm(""); setStatusFilter("");
    setPeriodo("tudo"); setDateStart(""); setDateEnd("");
    setCurrentPage(1);
  };

  const hasFilters = searchTerm || statusFilter || periodo !== "tudo";

  return (
    <div className="w-full min-h-screen bg-secondary p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl space-y-6">

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Orçamentos</h1>
            <p className="text-sm text-white/45 mt-1">
              {loading
                ? "Carregando..."
                : data.length === 0
                  ? "Propostas que você fez, num só lugar."
                  : `${data.length} ${data.length === 1 ? "orçamento" : "orçamentos"}`}
            </p>
          </div>
          <Link href="/vendas/orcamentos/novo">
            <Button className="bg-brand hover:bg-brand-strong text-white font-semibold rounded-lg px-5 glow-brand glow-brand-hover transition-base">
              <Plus className="mr-2 h-4 w-4" />
              Novo orçamento
            </Button>
          </Link>
        </div>

        {error && (
          <div className="flex flex-wrap items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-red-400 text-sm font-medium">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  doFetch(searchTerm, statusFilter).finally(() => setLoading(false));
                }}
                className="text-xs text-red-300 hover:underline mt-1"
              >
                Tentar novamente
              </button>
            </div>
            <button onClick={() => setError(null)} className="text-red-400/60 hover:text-red-400">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="bg-primary p-4 rounded-2xl border border-white/5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-white/50 text-xs font-medium block">Cliente ou número</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="pl-8 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-brand/50 h-9 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-white/50 text-xs font-medium block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as "" | StatusOrcamento); setCurrentPage(1); }}
                className="w-full bg-white/5 border border-white/10 text-white focus:border-green-500/50 h-9 px-3 rounded-md focus:outline-none text-sm"
              >
                <option value="">Todos</option>
                {STATUS_ORCAMENTO_OPTIONS.map((s) => (
                  <option key={s} value={s}>{STATUS_ORCAMENTO_LABEL[s]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-1">
            <label className="text-white/50 text-xs font-medium block mb-2">
              Data
            </label>
            <PeriodoPresets
              preset={periodo}
              dateStart={dateStart}
              dateEnd={dateEnd}
              onPresetChange={(p) => { setPeriodo(p); setCurrentPage(1); }}
              onCustomDateChange={(field, value) => {
                if (field === "start") setDateStart(value);
                else setDateEnd(value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

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
              {loading ? (
                <TableSkeleton columns={7} />
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-14 md:py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white/20" />
                      </div>
                      {hasFilters ? (
                        <>
                          <p className="text-white/40 text-sm">
                            Nada encontrado com os filtros atuais.
                          </p>
                          <button onClick={resetFilters} className="text-brand text-xs hover:text-brand-strong">
                            Limpar filtros
                          </button>
                        </>
                      ) : (
                        <>
                          <h3 className="text-base font-semibold text-white">
                            Nenhum orçamento por aqui ainda
                          </h3>
                          <p className="text-sm text-white/45 max-w-sm">
                            Faça uma proposta pra um cliente, salve, e quando ele aprovar é só virar pedido.
                          </p>
                          <Link href="/vendas/orcamentos/novo" className="inline-block mt-1">
                            <Button className="bg-brand hover:bg-brand-strong text-white font-semibold">
                              <Plus className="mr-2 h-4 w-4" />
                              Criar o primeiro
                            </Button>
                          </Link>
                        </>
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

        {!loading && filteredData.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-xs">
              Exibindo {(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filteredData.length)} de {filteredData.length} orçamentos
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setCurrentPage(1)} disabled={safePage === 1}
                className="w-9 h-9 rounded-lg border border-white/15 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center">
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setCurrentPage((p) => p - 1)} disabled={safePage === 1}
                className="w-9 h-9 rounded-lg border border-white/15 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="px-4 h-9 rounded-lg border border-brand/30 bg-brand/10 text-brand text-sm font-medium flex items-center gap-1">
                <span>{safePage}</span>
                <span className="text-white/30">/</span>
                <span className="text-white/40">{totalPages}</span>
              </div>
              <button onClick={() => setCurrentPage((p) => p + 1)} disabled={safePage === totalPages}
                className="w-9 h-9 rounded-lg border border-white/15 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center">
                <ChevronRight className="h-4 w-4" />
              </button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={safePage === totalPages}
                className="w-9 h-9 rounded-lg border border-white/15 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center">
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      <ConfirmDialog
        open={modalOpen}
        onOpenChange={(open) => !open && setModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isConfirming={isDeleting}
        title="Excluir orçamento?"
        description="Esse orçamento vai sumir da lista. Se já virou pedido, o pedido continua intacto."
        preview={
          orcamentoAlvo
            ? [
                {
                  label: "Número",
                  value: (
                    <span className="font-mono font-medium">
                      {orcamentoAlvo.numero}
                    </span>
                  ),
                },
                { label: "Cliente", value: orcamentoAlvo.clienteNome },
                {
                  label: "Valor",
                  value: `R$ ${Number(orcamentoAlvo.valorTotal).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                },
                {
                  label: "Validade",
                  value: (
                    <span className="text-white/80 text-sm">
                      {isoToDisplay(orcamentoAlvo.validade)}
                    </span>
                  ),
                },
              ]
            : undefined
        }
      />
    </div>
  );
}
