"use client";

import {
  Plus, Search, Calendar, Printer, Pencil, Trash2,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileText,
  Loader2, AlertCircle, AlertTriangle, X,
} from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import axios from "axios";
import {
  Pedido,
  STATUS_PEDIDO_OPTIONS,
  STATUS_PEDIDO_LABEL,
  STATUS_PEDIDO_STYLES,
  isoToDisplay,
} from "@/lib/data/vendas";
import type { StatusPedido } from "@/services/api/enums";
import { listPedidos, deletePedido } from "@/services/pedidos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { extractApiError } from "@/lib/utils/api-errors";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

function formatBRL(value: string | number): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(n)) return "0,00";
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

const ITEMS_PER_PAGE = 8;

export default function PedidosPage() {
  const [data, setData] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | StatusPedido>("");

  const [excluindo, setExcluindo] = useState<Pedido | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const doFetch = useCallback(
    async (search: string, status: "" | StatusPedido) => {
      setError(null);
      try {
        const result = await listPedidos({
          limit: 100,
          ...(search.trim() && { search: search.trim() }),
          ...(status && { status }),
        });
        setData(result.data);
      } catch (err) {
        setError(extractApiError(err, "Não foi possível carregar os pedidos."));
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
      data.filter((p) => {
        const pedidoDate = p.data.split("T")[0];
        const matchStart = dateStart === "" || pedidoDate >= dateStart;
        const matchEnd = dateEnd === "" || pedidoDate <= dateEnd;
        return matchStart && matchEnd;
      }),
    [data, dateStart, dateEnd]
  );

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedData = filteredData.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  async function confirmarExclusao() {
    if (!excluindo) return;
    setIsDeleting(true);
    try {
      await deletePedido(excluindo.id);
      setData((prev) => prev.filter((p) => p.id !== excluindo.id));
      setExcluindo(null);
    } catch (err) {
      setError(extractApiError(err, "Erro ao excluir o pedido."));
    } finally {
      setIsDeleting(false);
    }
  }

  const resetFilters = () => {
    setSearchTerm(""); setStatusFilter("");
    setDateStart(""); setDateEnd("");
    setCurrentPage(1);
  };

  const hasFilters = searchTerm || statusFilter || dateStart || dateEnd;

  return (
    <div className="w-full min-h-screen bg-secondary p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl space-y-6">

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">Vendas</p>
            <h1 className="text-3xl font-black text-white tracking-tighter">Histórico de Pedidos</h1>
            <p className="text-sm text-white/40 mt-1">
              {loading ? "Carregando..." : `${data.length} ${data.length === 1 ? "pedido" : "pedidos"}`}
            </p>
          </div>
          <Link href="/vendas/pedidos/novo">
            <Button className="bg-green-500 hover:bg-green-400 text-white font-bold rounded-full px-5 transition-all hover:scale-105 active:scale-95">
              <Plus className="mr-2 h-4 w-4" />
              Novo Pedido
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-primary p-4 rounded-2xl border border-white/5">
          <div className="md:col-span-1 space-y-1.5">
            <label className="text-white/50 text-xs font-medium block">Cliente / Nº pedido</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-8 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-green-500/50 h-9 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-white/50 text-xs font-medium block">Data início</label>
            <div className="relative">
              <Input
                type="date"
                value={dateStart}
                onChange={(e) => { setDateStart(e.target.value); setCurrentPage(1); }}
                className="bg-white/5 border-white/10 text-white focus:border-green-500/50 h-9 text-sm pr-9"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-white/50 text-xs font-medium block">Data fim</label>
            <div className="relative">
              <Input
                type="date"
                value={dateEnd}
                onChange={(e) => { setDateEnd(e.target.value); setCurrentPage(1); }}
                className="bg-white/5 border-white/10 text-white focus:border-green-500/50 h-9 text-sm pr-9"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-white/50 text-xs font-medium block">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as "" | StatusPedido); setCurrentPage(1); }}
              className="w-full bg-white/5 border border-white/10 text-white focus:border-green-500/50 h-9 px-3 rounded-md focus:outline-none text-sm"
            >
              <option value="">Todos</option>
              {STATUS_PEDIDO_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_PEDIDO_LABEL[s]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 overflow-hidden bg-primary">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/10 hover:bg-transparent bg-white/5">
                <TableHead className="text-white/50 font-semibold text-xs uppercase tracking-wider">Nº Pedido</TableHead>
                <TableHead className="text-white/50 font-semibold text-xs uppercase tracking-wider">Data</TableHead>
                <TableHead className="text-white/50 font-semibold text-xs uppercase tracking-wider">Cliente</TableHead>
                <TableHead className="text-white/50 font-semibold text-xs uppercase tracking-wider text-right">Valor Total</TableHead>
                <TableHead className="text-white/50 font-semibold text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-white/50 font-semibold text-xs uppercase tracking-wider text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
                      <p className="text-white/40 text-sm">Carregando pedidos...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white/20" />
                      </div>
                      <p className="text-white/40 text-sm">
                        {hasFilters
                          ? "Nenhum pedido encontrado para os filtros."
                          : "Você ainda não criou nenhum pedido."}
                      </p>
                      {hasFilters && (
                        <button onClick={resetFilters} className="text-green-400 text-xs hover:underline">
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
                    <TableCell className="text-white font-mono font-medium text-sm">{pedido.numero}</TableCell>
                    <TableCell className="text-white/70 text-sm">{isoToDisplay(pedido.data)}</TableCell>
                    <TableCell className="text-white text-sm font-medium">{pedido.clienteNome}</TableCell>
                    <TableCell className="text-white text-sm font-semibold text-right">
                      R$ {formatBRL(pedido.valorTotal)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${STATUS_PEDIDO_STYLES[pedido.status] ?? "bg-white/10 text-white/60 border-white/20"} border text-xs font-medium`}
                      >
                        {STATUS_PEDIDO_LABEL[pedido.status] ?? pedido.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          title="Imprimir pedido"
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                          onClick={() => window.print()}
                        >
                          <Printer className="h-4 w-4 text-white/40 group-hover:text-white transition-colors" />
                        </button>
                        <Link href={`/vendas/pedidos/${pedido.id}/editar`}>
                          <button
                            title="Editar pedido"
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                          >
                            <Pencil className="h-4 w-4 text-white/40 group-hover:text-green-400 transition-colors" />
                          </button>
                        </Link>
                        <button
                          title="Excluir pedido"
                          onClick={() => setExcluindo(pedido)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
                        >
                          <Trash2 className="h-4 w-4 text-white/40 group-hover:text-red-400 transition-colors" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!loading && filteredData.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-xs">
              Exibindo {(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filteredData.length)} de {filteredData.length} pedidos
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setCurrentPage(1)} disabled={safePage === 1}
                className="w-9 h-9 rounded-lg border border-white/15 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center">
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}
                className="w-9 h-9 rounded-lg border border-white/15 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="px-4 h-9 rounded-lg border border-green-500/30 bg-green-500/10 text-green-400 text-sm font-medium flex items-center gap-1">
                <span>{safePage}</span>
                <span className="text-white/30">/</span>
                <span className="text-white/40">{totalPages}</span>
              </div>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
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

      {/* Modal exclusão */}
      {excluindo && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => !isDeleting && setExcluindo(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-primary border border-red-500/30 text-white w-full max-w-sm rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <h2 className="text-white font-bold text-lg">Excluir pedido?</h2>
              <p className="text-white/60 text-sm">
                Deseja excluir o pedido <span className="text-white font-semibold">{excluindo.numero}</span>? Esta ação não poderá ser desfeita.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setExcluindo(null)} disabled={isDeleting} className="flex-1 border border-white/10 text-white hover:bg-white/10">
                Cancelar
              </Button>
              <Button type="button" variant="destructive" onClick={confirmarExclusao} disabled={isDeleting} className="flex-1">
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                {isDeleting ? "Excluindo..." : "Sim, excluir"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
