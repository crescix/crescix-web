"use client";

import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import {
  ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, TrendingDown,
  Search, FileText, Clock, AlertCircle, RefreshCw, X,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  TransacaoFluxo,
  formatBRL,
  formatDateBR,
  buildTransacoesFluxo,
  calcResumoFluxo,
  agruparPorDia,
} from "@/lib/data/financeiro";
import { listContasPagar } from "@/services/contas-pagar";
import { listContasReceber } from "@/services/contas-receber";
import { listPedidos } from "@/services/pedidos";
import { listMovimentos } from "@/services/movimentos-estoque";
import { ORIGEM_LABEL } from "@/lib/data/financeiro";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { extractApiError } from "@/lib/utils/api-errors";

import {
  PeriodoPresets,
  resolveRange,
  type PeriodoPreset,
} from "@/components/ui/periodo-presets";

export default function FluxoDeCaixaPage() {
  const [transacoes, setTransacoes] = useState<TransacaoFluxo[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [periodo, setPeriodo] = useState<PeriodoPreset>("30d");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [tipoFilter, setTipoFilter] = useState<"" | "entrada" | "saida">("");
  const [naturezaFilter, setNaturezaFilter] =
    useState<"" | "Realizada" | "Prevista">("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTransacoes = async () => {
    setMounted(false);
    setLoadError(null);
    try {
      const [pagarRes, receberRes, pedidosRes, movimentosRes] =
        await Promise.all([
          listContasPagar({ limit: 500 }),
          listContasReceber({ limit: 500 }),
          listPedidos({ limit: 500 }),
          listMovimentos({ limit: 500, tipo: "ENTRADA", motivo: "COMPRA" }),
        ]);
      setTransacoes(
        buildTransacoesFluxo({
          pagar: pagarRes.data,
          receber: receberRes.data,
          pedidos: pedidosRes.data,
          movimentos: movimentosRes.data,
        })
      );
    } catch (err) {
      setLoadError(extractApiError(err, "Não consegui carregar as transações agora."));
    } finally {
      setMounted(true);
    }
  };

  useEffect(() => {
    fetchTransacoes();
  }, []);

  const periodoRange = useMemo(() => {
    const { from, to } = resolveRange(periodo, dateStart, dateEnd);
    return { start: from, end: to };
  }, [periodo, dateStart, dateEnd]);

  const filtered = useMemo(() => {
    return transacoes.filter((t) => {
      if (periodoRange.start && t.data < periodoRange.start) return false;
      if (periodoRange.end && t.data > periodoRange.end) return false;
      if (tipoFilter && t.tipo !== tipoFilter) return false;
      if (naturezaFilter && t.natureza !== naturezaFilter) return false;
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        const hit =
          t.descricao.toLowerCase().includes(s) ||
          t.categoria.toLowerCase().includes(s) ||
          (t.contraparte?.toLowerCase().includes(s) ?? false);
        if (!hit) return false;
      }
      return true;
    });
  }, [transacoes, periodoRange, tipoFilter, naturezaFilter, searchTerm]);

  const resumo = useMemo(() => calcResumoFluxo(filtered), [filtered]);
  const grafico = useMemo(() => agruparPorDia(filtered), [filtered]);

  const resetFilters = () => {
    setPeriodo("30d"); setDateStart(""); setDateEnd("");
    setTipoFilter(""); setNaturezaFilter(""); setSearchTerm("");
  };

  return (
    <div className="w-full min-h-screen bg-secondary p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-7xl space-y-6">

        {/* Header */}
        <div>
          <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">
            Financeiro
          </p>
          <h1 className="text-3xl font-black text-white tracking-tighter">
            Fluxo de Caixa
          </h1>
        </div>

        {loadError && (
          <div className="flex flex-wrap items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="flex-1 text-red-400 text-sm font-medium">{loadError}</p>
            <button
              onClick={fetchTransacoes}
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

        {/* Cards — Realizado */}
        <div>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">
            Realizado no período
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ResumoCard
              label="Entradas"
              value={formatBRL(resumo.entradas)}
              icon={<ArrowUpRight className="w-5 h-5 text-green-400" />}
              bg="bg-green-500/10"
              textColor="text-green-400"
              hint="Contas recebidas"
              hintIcon={<TrendingUp className="w-3 h-3" />}
            />
            <ResumoCard
              label="Saídas"
              value={formatBRL(resumo.saidas)}
              icon={<ArrowDownRight className="w-5 h-5 text-red-400" />}
              bg="bg-red-500/10"
              textColor="text-red-400"
              hint="Contas pagas"
              hintIcon={<TrendingDown className="w-3 h-3" />}
            />
            <ResumoCard
              label="Saldo Líquido"
              value={`${resumo.saldo < 0 ? "-" : ""}${formatBRL(Math.abs(resumo.saldo))}`}
              icon={<Wallet className={`w-5 h-5 ${resumo.saldo >= 0 ? "text-green-400" : "text-red-400"}`} />}
              bg={resumo.saldo >= 0 ? "bg-green-500/10" : "bg-red-500/10"}
              textColor={resumo.saldo >= 0 ? "text-green-400" : "text-red-400"}
              hint={resumo.saldo >= 0 ? "Resultado positivo" : "Resultado negativo"}
            />
          </div>
        </div>

        {/* Cards — Previsto */}
        <div>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">
            Previsto (pendente)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ResumoCard
              label="A Receber"
              value={formatBRL(resumo.entradasPrevistas)}
              icon={<Clock className="w-5 h-5 text-green-400/70" />}
              bg="bg-green-500/5"
              textColor="text-green-400/80"
              hint="Contas pendentes"
            />
            <ResumoCard
              label="A Pagar"
              value={formatBRL(resumo.saidasPrevistas)}
              icon={<Clock className="w-5 h-5 text-red-400/70" />}
              bg="bg-red-500/5"
              textColor="text-red-400/80"
              hint="Contas pendentes"
            />
            <ResumoCard
              label="Saldo Projetado"
              value={`${resumo.saldoProjetado < 0 ? "-" : ""}${formatBRL(Math.abs(resumo.saldoProjetado))}`}
              icon={<Wallet className={`w-5 h-5 ${resumo.saldoProjetado >= 0 ? "text-amber-400" : "text-red-400"}`} />}
              bg={resumo.saldoProjetado >= 0 ? "bg-amber-500/10" : "bg-red-500/10"}
              textColor={resumo.saldoProjetado >= 0 ? "text-amber-400" : "text-red-400"}
              hint="Realizado + previsto"
            />
          </div>
        </div>

        {/* Gráfico */}
        <div className="bg-primary rounded-2xl border border-white/10 p-6">
          <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-sm font-bold text-white">Entradas vs Saídas por dia</h2>
              <p className="text-xs text-white/30 mt-0.5">Apenas transações realizadas</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {!mounted ? (
              <div className="h-full flex items-center justify-center text-white/30 text-sm">
                Carregando...
              </div>
            ) : grafico.length === 0 ? (
              <div className="h-full flex items-center justify-center text-white/30 text-sm">
                Sem dados realizados no período
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={grafico} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grad-entradas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ade80" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="grad-saidas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="data"
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                    tickFormatter={(v: string) => formatDateBR(v).slice(0, 5)}
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                    tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`}
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f1929",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                    labelFormatter={(v: string) => formatDateBR(v)}
                    formatter={(v: number) => formatBRL(v)}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                  <Area
                    type="monotone"
                    dataKey="entradas"
                    name="Entradas"
                    stroke="#4ade80"
                    fill="url(#grad-entradas)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="saidas"
                    name="Saídas"
                    stroke="#f87171"
                    fill="url(#grad-saidas)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-primary p-4 rounded-2xl border border-white/5 space-y-4">
          <PeriodoPresets
            preset={periodo}
            dateStart={dateStart}
            dateEnd={dateEnd}
            onPresetChange={setPeriodo}
            onCustomDateChange={(field, value) => {
              if (field === "start") setDateStart(value);
              else setDateEnd(value);
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-white/50 text-xs font-medium block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                <Input
                  placeholder="Descrição, categoria, contraparte..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-green-500/50 h-9 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-white/50 text-xs font-medium block">Tipo</label>
              <select
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value as typeof tipoFilter)}
                className="w-full bg-white/5 border border-white/10 text-white focus:border-green-500/50 h-9 px-3 rounded-md focus:outline-none text-sm"
              >
                <option value="">Todos</option>
                <option value="entrada">Entradas</option>
                <option value="saida">Saídas</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-white/50 text-xs font-medium block">Natureza</label>
              <select
                value={naturezaFilter}
                onChange={(e) => setNaturezaFilter(e.target.value as typeof naturezaFilter)}
                className="w-full bg-white/5 border border-white/10 text-white focus:border-green-500/50 h-9 px-3 rounded-md focus:outline-none text-sm"
              >
                <option value="">Todas</option>
                <option value="Realizada">Realizada</option>
                <option value="Prevista">Prevista</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-primary">
          <div className="px-6 py-4 flex items-center gap-3 border-b border-white/10">
            <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs font-bold flex items-center justify-center">
              ↕
            </span>
            <div>
              <h2 className="text-sm font-bold text-white">Histórico de Transações</h2>
              <p className="text-xs text-white/30 mt-0.5">
                {filtered.length} {filtered.length === 1 ? "transação" : "transações"} no filtro atual
              </p>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/10 hover:bg-transparent bg-white/5">
                {["Data", "Descrição", "Categoria", "Contraparte", "Origem", "Natureza", "Valor"].map((h) => (
                  <TableHead
                    key={h}
                    className={`text-white/50 font-semibold text-xs uppercase tracking-wider ${h === "Valor" ? "text-right" : ""}`}
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {!mounted ? (
                <TableSkeleton columns={7} />
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white/20" />
                      </div>
                      <p className="text-white/40 text-sm">
                        Nenhuma transação no período/filtro
                      </p>
                      <button onClick={resetFilters} className="text-green-400 text-xs hover:underline">
                        Limpar filtros
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((t) => (
                  <TableRow key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="text-white/70 text-sm">{formatDateBR(t.data)}</TableCell>
                    <TableCell className="text-white text-sm font-medium max-w-xs truncate">
                      {t.descricao}
                    </TableCell>
                    <TableCell className="text-white/70 text-sm">{t.categoria}</TableCell>
                    <TableCell className="text-white/70 text-sm">
                      {t.contraparte ?? <span className="text-white/30">—</span>}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${
                        t.tipo === "entrada"
                          ? "bg-green-500/15 text-green-400 border-green-500/25"
                          : "bg-red-500/15 text-red-400 border-red-500/25"
                      } border text-xs font-medium`}>
                        {ORIGEM_LABEL[t.origem]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        t.natureza === "Realizada"
                          ? "bg-green-500/15 text-green-400 border-green-500/25 border text-xs font-medium"
                          : "bg-white/10 text-white/60 border-white/20 border text-xs font-medium"
                      }>
                        {t.natureza}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <span className={`inline-flex items-center gap-1 text-sm font-semibold ${
                        t.tipo === "entrada" ? "text-green-400" : "text-red-400"
                      }`}>
                        {t.tipo === "entrada" ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                        {t.tipo === "entrada" ? "+" : "−"} {formatBRL(t.valor)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

      </div>
    </div>
  );
}

interface ResumoCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  bg: string;
  textColor: string;
  hint?: string;
  hintIcon?: React.ReactNode;
}

function ResumoCard({ label, value, icon, bg, textColor, hint, hintIcon }: ResumoCardProps) {
  return (
    <div className="bg-primary rounded-2xl border border-white/10 p-5 flex items-center gap-4">
      <div className={`${bg} rounded-xl p-3 flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-white/40 font-medium">{label}</p>
        <p className={`text-lg font-bold mt-0.5 truncate ${textColor}`}>{value}</p>
        {hint && (
          <div className={`flex items-center gap-1 mt-1 text-xs ${textColor}/60`}>
            {hintIcon}
            {hint}
          </div>
        )}
      </div>
    </div>
  );
}
