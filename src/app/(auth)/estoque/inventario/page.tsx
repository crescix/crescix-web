"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  X,
  ClipboardList,
  ChevronLeft,
  AlertCircle,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  RefreshCw,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  MovimentoEstoque,
  MOTIVO_MOVIMENTO_LABEL,
  formatDateBR,
} from "@/lib/data/estoque";
import {
  listMovimentos,
  createMovimento,
} from "@/services/movimentos-estoque";
import { listProdutos, type Produto } from "@/services/produtos";
import { extractApiError } from "@/lib/utils/api-errors";
import { useToast } from "@/components/ui/toast";

type LinhaInventario = {
  produtoId: string;
  produtoNome: string;
  totalEntradas: number;
  totalSaidas: number;
  totalAjustes: number; // delta liquido dos ajustes (positivo ou negativo)
  saldoFinal: number;
};

const MOTIVOS_AJUSTE = [
  "Contagem física",
  "Produto danificado",
  "Erro de lançamento",
  "Devolução não registrada",
  "Outros",
];

const inputClass =
  "w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-green-500/50 text-sm transition-colors";
const selectClass =
  "w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-green-500/50 text-sm transition-colors cursor-pointer";

function Field({
  label,
  required,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-white/50 text-xs font-semibold uppercase tracking-wide">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function Inventario() {
  const router = useRouter();

  const [movimentos, setMovimentos] = useState<MovimentoEstoque[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [busca, setBusca] = useState("");
  const [filtroSaldo, setFiltroSaldo] =
    useState<"todos" | "ok" | "baixo" | "zerado">("todos");

  // Modal de ajuste
  const [modalAjuste, setModalAjuste] = useState(false);
  const [produtoAlvo, setProdutoAlvo] = useState<LinhaInventario | null>(null);
  const [novaQtd, setNovaQtd] = useState("");
  const [motivoAjuste, setMotivoAjuste] = useState("");
  const [observacoesAjuste, setObservacoesAjuste] = useState("");
  const [erros, setErros] = useState<{ qtd?: string; motivo?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Modal histórico
  const [modalHistorico, setModalHistorico] = useState(false);
  const [produtoHistorico, setProdutoHistorico] =
    useState<LinhaInventario | null>(null);

  const toast = useToast();

  async function fetchData() {
    setLoading(true);
    setLoadError(null);
    try {
      const [movRes, prodRes] = await Promise.all([
        listMovimentos({ limit: 500 }),
        listProdutos({ limit: 500 }),
      ]);
      setMovimentos(movRes.data);
      setProdutos(prodRes.data);
    } catch (err) {
      setLoadError(extractApiError(err, "Erro ao carregar inventário."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  /* ── Calcula inventário a partir dos movimentos ── */
  const inventario = useMemo<LinhaInventario[]>(() => {
    // Inicia com todos os produtos cadastrados (pra mostrar mesmo os sem movimento)
    const map = new Map<string, LinhaInventario>();
    for (const p of produtos) {
      map.set(p.id, {
        produtoId: p.id,
        produtoNome: p.nome,
        totalEntradas: 0,
        totalSaidas: 0,
        totalAjustes: 0,
        saldoFinal: 0,
      });
    }

    for (const m of movimentos) {
      const linha = map.get(m.produtoId);
      if (!linha) continue;

      const sinal = m.tipo === "ENTRADA" ? 1 : -1;
      if (m.motivo === "AJUSTE_MANUAL") {
        linha.totalAjustes += sinal * m.quantidade;
      } else if (m.tipo === "ENTRADA") {
        linha.totalEntradas += m.quantidade;
      } else {
        linha.totalSaidas += m.quantidade;
      }
      linha.saldoFinal += sinal * m.quantidade;
    }

    return Array.from(map.values()).sort((a, b) =>
      a.produtoNome.localeCompare(b.produtoNome)
    );
  }, [movimentos, produtos]);

  const inventarioFiltrado = useMemo(() => {
    return inventario.filter((linha) => {
      const mBusca =
        !busca || linha.produtoNome.toLowerCase().includes(busca.toLowerCase());
      const mSaldo =
        filtroSaldo === "todos"
          ? true
          : filtroSaldo === "zerado"
          ? linha.saldoFinal <= 0
          : filtroSaldo === "baixo"
          ? linha.saldoFinal > 0 && linha.saldoFinal <= 5
          : linha.saldoFinal > 5;
      return mBusca && mSaldo;
    });
  }, [inventario, busca, filtroSaldo]);

  const totalProdutos = inventario.length;
  const totalUnidades = inventario.reduce((s, l) => s + l.saldoFinal, 0);
  const produtosBaixo = inventario.filter(
    (l) => l.saldoFinal > 0 && l.saldoFinal <= 5
  ).length;
  const produtosZerado = inventario.filter((l) => l.saldoFinal <= 0).length;

  function abrirAjuste(linha: LinhaInventario) {
    setProdutoAlvo(linha);
    setNovaQtd(String(linha.saldoFinal));
    setMotivoAjuste("");
    setObservacoesAjuste("");
    setErros({});
    setSubmitError(null);
    setModalAjuste(true);
  }

  function validarAjuste(): boolean {
    const e: typeof erros = {};
    if (novaQtd === "" || Number(novaQtd) < 0)
      e.qtd = "Informe uma quantidade válida (≥ 0)";
    if (!motivoAjuste) e.motivo = "Selecione um motivo";
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function confirmarAjuste() {
    if (!produtoAlvo || !validarAjuste()) return;
    const delta = Number(novaQtd) - produtoAlvo.saldoFinal;
    if (delta === 0) {
      setSubmitError("A quantidade nova é igual ao saldo atual.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const obs = [motivoAjuste, observacoesAjuste].filter(Boolean).join(" — ");
      await createMovimento({
        produtoId: produtoAlvo.produtoId,
        tipo: delta > 0 ? "ENTRADA" : "SAIDA",
        motivo: "AJUSTE_MANUAL",
        quantidade: Math.abs(delta),
        observacoes: obs,
      });
      setModalAjuste(false);
      setProdutoAlvo(null);
      toast.success(`Ajuste de "${produtoAlvo.produtoNome}" registrado!`);
      fetchData();
    } catch (err) {
      setSubmitError(extractApiError(err, "Erro ao salvar ajuste."));
    } finally {
      setSubmitting(false);
    }
  }

  function abrirHistorico(linha: LinhaInventario) {
    setProdutoHistorico(linha);
    setModalHistorico(true);
  }

  const ajustesHistorico = produtoHistorico
    ? movimentos
        .filter(
          (m) =>
            m.produtoId === produtoHistorico.produtoId &&
            m.motivo === "AJUSTE_MANUAL"
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : [];

  function saldoBadge(saldo: number) {
    if (saldo <= 0)
      return {
        cls: "bg-red-500/10 text-red-400 border-red-500/20",
        label: "Zerado",
      };
    if (saldo <= 5)
      return {
        cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        label: "Baixo",
      };
    return {
      cls: "bg-green-500/10 text-green-400 border-green-500/20",
      label: "OK",
    };
  }

  return (
    <div className="w-full min-h-screen bg-secondary p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl text-white/50 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-1">
                Estoque
              </p>
              <h1 className="text-3xl font-black text-white tracking-tighter">
                Inventário
              </h1>
            </div>
          </div>
        </div>

        {loadError && (
          <div className="flex flex-wrap items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="flex-1 text-red-400 text-sm font-medium">{loadError}</p>
            <button
              onClick={fetchData}
              className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-1"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Tentar novamente
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Produtos",
              value: totalProdutos,
              color: "text-white",
              icon: <ClipboardList className="h-4 w-4" />,
            },
            {
              label: "Total unidades",
              value: totalUnidades,
              color: "text-green-400",
              icon: <TrendingUp className="h-4 w-4" />,
            },
            {
              label: "Estoque baixo",
              value: produtosBaixo,
              color: "text-yellow-400",
              icon: <Minus className="h-4 w-4" />,
            },
            {
              label: "Zerados",
              value: produtosZerado,
              color: "text-red-400",
              icon: <TrendingDown className="h-4 w-4" />,
            },
          ].map((c) => (
            <div
              key={c.label}
              className="bg-primary rounded-2xl border border-white/10 p-5 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-xs font-semibold uppercase tracking-wide">
                  {c.label}
                </span>
                <span className={`${c.color} opacity-60`}>{c.icon}</span>
              </div>
              <span className={`text-3xl font-black ${c.color}`}>{c.value}</span>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="bg-primary rounded-2xl border border-white/10 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
              <Search className="h-3 w-3" />
            </span>
            <h2 className="text-base font-bold text-white">Filtrar Inventário</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Produto">
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar produto..."
                className={inputClass}
              />
            </Field>

            <Field label="Status do saldo">
              <select
                value={filtroSaldo}
                onChange={(e) =>
                  setFiltroSaldo(e.target.value as typeof filtroSaldo)
                }
                className={selectClass}
              >
                <option value="todos" className="bg-[#0f2f52]">
                  Todos
                </option>
                <option value="ok" className="bg-[#0f2f52]">
                  OK (&gt; 5)
                </option>
                <option value="baixo" className="bg-[#0f2f52]">
                  Estoque baixo (1–5)
                </option>
                <option value="zerado" className="bg-[#0f2f52]">
                  Zerados / negativos
                </option>
              </select>
            </Field>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-primary rounded-2xl border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h2 className="text-base font-bold text-white">Saldo por produto</h2>
            <span className="text-white/40 text-xs">
              {inventarioFiltrado.length}{" "}
              {inventarioFiltrado.length === 1 ? "produto" : "produtos"}
            </span>
          </div>

          {loading ? (
            <div className="py-16 flex items-center justify-center gap-2 text-white/60">
              <Loader2 className="h-4 w-4 animate-spin text-green-400" />
              <span className="text-sm">Carregando...</span>
            </div>
          ) : inventarioFiltrado.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <ClipboardList className="h-8 w-8 text-white/15" />
              <p className="text-white/30 text-sm">
                {produtos.length === 0
                  ? "Cadastre produtos primeiro pra ver o inventário"
                  : "Nenhum produto com esses filtros"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="text-white/40 text-xs font-semibold text-left px-6 py-3">
                      Produto
                    </th>
                    <th className="text-white/40 text-xs font-semibold text-center px-4 py-3">
                      Entradas
                    </th>
                    <th className="text-white/40 text-xs font-semibold text-center px-4 py-3">
                      Saídas
                    </th>
                    <th className="text-white/40 text-xs font-semibold text-center px-4 py-3">
                      Ajustes
                    </th>
                    <th className="text-white/40 text-xs font-semibold text-center px-4 py-3">
                      Saldo
                    </th>
                    <th className="text-white/40 text-xs font-semibold text-center px-4 py-3">
                      Status
                    </th>
                    <th className="text-white/40 text-xs font-semibold text-center px-6 py-3">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inventarioFiltrado.map((linha) => {
                    const badge = saldoBadge(linha.saldoFinal);
                    return (
                      <tr
                        key={linha.produtoId}
                        className="border-t border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 text-white font-medium">
                          {linha.produtoNome}
                        </td>
                        <td className="px-4 py-4 text-center text-green-400 tabular-nums">
                          +{linha.totalEntradas}
                        </td>
                        <td className="px-4 py-4 text-center text-red-400 tabular-nums">
                          −{linha.totalSaidas}
                        </td>
                        <td className="px-4 py-4 text-center text-cyan-400 tabular-nums">
                          {linha.totalAjustes > 0 ? "+" : ""}
                          {linha.totalAjustes}
                        </td>
                        <td className="px-4 py-4 text-center text-white font-bold tabular-nums">
                          {linha.saldoFinal}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badge.cls}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => abrirAjuste(linha)}
                              className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-semibold transition-all active:scale-95"
                            >
                              <SlidersHorizontal className="h-3 w-3" /> Ajustar
                            </button>
                            <button
                              onClick={() => abrirHistorico(linha)}
                              className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs font-semibold transition-all active:scale-95"
                            >
                              <Clock className="h-3 w-3" /> Histórico
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL AJUSTE */}
      {modalAjuste && produtoAlvo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-primary w-full max-w-md rounded-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                  <SlidersHorizontal className="h-3 w-3" />
                </span>
                <h2 className="text-base font-bold text-white">Ajustar saldo</h2>
              </div>
              <button
                onClick={() => !submitting && setModalAjuste(false)}
                disabled={submitting}
                className="text-white/30 hover:text-white/70 transition disabled:opacity-30"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-white/50 text-xs uppercase tracking-wide mb-1">
                  Produto
                </p>
                <p className="text-white font-medium">{produtoAlvo.produtoNome}</p>
                <p className="text-white/40 text-xs mt-2">
                  Saldo atual:{" "}
                  <span className="text-white font-semibold">
                    {produtoAlvo.saldoFinal} un
                  </span>
                </p>
              </div>

              {submitError && (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="flex-1 text-red-400 text-sm font-medium">
                    {submitError}
                  </p>
                </div>
              )}

              <Field label="Quantidade real (nova)" required>
                <input
                  type="number"
                  min={0}
                  value={novaQtd}
                  onChange={(e) => setNovaQtd(e.target.value)}
                  className={`${inputClass} ${
                    erros.qtd ? "border-red-400/50" : ""
                  }`}
                />
                {erros.qtd && (
                  <p className="text-red-400 text-xs">{erros.qtd}</p>
                )}
              </Field>

              <Field label="Motivo" required>
                <select
                  value={motivoAjuste}
                  onChange={(e) => setMotivoAjuste(e.target.value)}
                  className={`${selectClass} ${
                    erros.motivo ? "border-red-400/50" : ""
                  }`}
                >
                  <option value="" className="bg-[#0f2f52]">
                    Selecione...
                  </option>
                  {MOTIVOS_AJUSTE.map((m) => (
                    <option key={m} value={m} className="bg-[#0f2f52]">
                      {m}
                    </option>
                  ))}
                </select>
                {erros.motivo && (
                  <p className="text-red-400 text-xs">{erros.motivo}</p>
                )}
              </Field>

              <Field label="Observações">
                <textarea
                  value={observacoesAjuste}
                  onChange={(e) => setObservacoesAjuste(e.target.value)}
                  rows={3}
                  placeholder="Detalhes do ajuste..."
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-green-500/50 text-sm transition-colors resize-none"
                />
              </Field>
            </div>

            <div className="flex justify-end gap-3 px-6 pb-6 border-t border-white/10 pt-4">
              <button
                onClick={() => !submitting && setModalAjuste(false)}
                disabled={submitting}
                className="px-5 h-10 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAjuste}
                disabled={submitting}
                className="flex items-center gap-2 px-6 h-10 rounded-xl bg-green-500 hover:bg-green-400 text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Salvando..." : "Confirmar ajuste"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HISTÓRICO */}
      {modalHistorico && produtoHistorico && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-primary w-full max-w-2xl rounded-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-primary z-10">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                  <Clock className="h-3 w-3" />
                </span>
                <h2 className="text-base font-bold text-white">
                  Histórico de ajustes — {produtoHistorico.produtoNome}
                </h2>
              </div>
              <button
                onClick={() => setModalHistorico(false)}
                className="text-white/30 hover:text-white/70 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {ajustesHistorico.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Clock className="h-8 w-8 text-white/15" />
                  <p className="text-white/30 text-sm">
                    Nenhum ajuste registrado pra esse produto.
                  </p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-white/40 text-xs font-semibold text-left py-3">
                        Data
                      </th>
                      <th className="text-white/40 text-xs font-semibold text-center py-3">
                        Tipo
                      </th>
                      <th className="text-white/40 text-xs font-semibold text-center py-3">
                        Qtd
                      </th>
                      <th className="text-white/40 text-xs font-semibold text-left py-3">
                        Observações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ajustesHistorico.map((a) => (
                      <tr
                        key={a.id}
                        className="border-t border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 text-white/60 font-mono text-xs">
                          {formatDateBR(a.createdAt)}
                        </td>
                        <td className="py-3 text-center">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                              a.tipo === "ENTRADA"
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/20"
                            }`}
                          >
                            {a.tipo === "ENTRADA" ? "+ Entrada" : "− Saída"}
                          </span>
                        </td>
                        <td className="py-3 text-center text-white font-semibold tabular-nums">
                          {a.quantidade}
                        </td>
                        <td className="py-3 text-white/70 text-xs">
                          {a.observacoes ?? MOTIVO_MOVIMENTO_LABEL[a.motivo]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
