"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search, X, ClipboardList, ChevronLeft,
  AlertCircle, SlidersHorizontal, TrendingUp, TrendingDown, Minus,
} from "lucide-react";
import { useRouter } from "next/navigation";

/* ─── Tipos ─────────────────────────────────────────────────── */
type Entrada = { id: number; produto: string; quantidade: number };
type Saida   = { id: number; produto: string; quantidade: number };

type Ajuste = {
  id: number;
  produto: string;
  quantidadeAnterior: number;
  quantidadeNova: number;
  motivo: string;
  data: string;
};

type LinhaInventario = {
  produto: string;
  totalEntradas: number;
  totalSaidas: number;
  saldoCalculado: number;
  ajustes: number;       // soma dos ajustes manuais
  saldoFinal: number;
};

const MOTIVOS_AJUSTE = [
  "Contagem física",
  "Produto danificado",
  "Erro de lançamento",
  "Devolução não registrada",
  "Outros",
];

/* ─── localStorage helpers ───────────────────────────────────── */
function getLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch { return fallback; }
}
function setLS<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ─── CSS helpers ────────────────────────────────────────────── */
const inputClass  = "w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-cyan-500/50 text-sm transition-colors";
const selectClass = "w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 text-sm transition-colors cursor-pointer";

function Field({ label, required, children, className = "" }: {
  label: string; required?: boolean; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-white/50 text-xs font-semibold uppercase tracking-wide">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

/* ─── Seed de ajustes ────────────────────────────────────────── */
const SEED_AJUSTES: Ajuste[] = [
  { id: 1, produto: "Camiseta Preta",   quantidadeAnterior: 40, quantidadeNova: 38, motivo: "Contagem física",   data: "2026-05-10" },
  { id: 2, produto: "Tênis Branco",     quantidadeAnterior: 8,  quantidadeNova: 7,  motivo: "Produto danificado", data: "2026-05-12" },
];

/* ─── Componente ─────────────────────────────────────────────── */
export default function Inventario() {
  const router = useRouter();

  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [saidas,   setSaidas]   = useState<Saida[]>([]);
  const [ajustes,  setAjustes]  = useState<Ajuste[]>([]);

  const [busca,       setBusca]       = useState("");
  const [filtroSaldo, setFiltroSaldo] = useState<"todos" | "ok" | "baixo" | "zerado">("todos");

  // Modal de ajuste
  const [modalAjuste,   setModalAjuste]   = useState(false);
  const [produtoAlvo,   setProdutoAlvo]   = useState<LinhaInventario | null>(null);
  const [novaQtd,       setNovaQtd]       = useState("");
  const [motivoAjuste,  setMotivoAjuste]  = useState("");
  const [erros,         setErros]         = useState<{ qtd?: string; motivo?: string }>({});

  // Modal histórico de ajustes
  const [modalHistorico, setModalHistorico] = useState(false);
  const [produtoHistorico, setProdutoHistorico] = useState<string | null>(null);

  // Modal confirmação ajuste
  const [modalConfirma, setModalConfirma] = useState(false);

  const [sucesso, setSucesso] = useState<string | null>(null);

  /* ── Fecha sucesso automaticamente ── */
  useEffect(() => {
    if (!sucesso) return;
    const t = setTimeout(() => setSucesso(null), 2000);
    return () => clearTimeout(t);
  }, [sucesso]);

  /* ── Carrega dados ── */
  useEffect(() => {
    setEntradas(getLS<Entrada[]>("entradas_estoque", []));
    setSaidas(getLS<Saida[]>("saidas_estoque", []));

    let aj = getLS<Ajuste[]>("ajustes_estoque", []);
    if (aj.length === 0) { setLS("ajustes_estoque", SEED_AJUSTES); aj = SEED_AJUSTES; }
    setAjustes(aj);
  }, []);

  /* ── Calcula inventário ── */
  const inventario = useMemo<LinhaInventario[]>(() => {
    const produtos = Array.from(new Set([
      ...entradas.map((e) => e.produto),
      ...saidas.map((s) => s.produto),
      ...ajustes.map((a) => a.produto),
    ])).filter(Boolean).sort();

    return produtos.map((produto) => {
      const totalEntradas  = entradas.filter((e) => e.produto === produto).reduce((s, e) => s + e.quantidade, 0);
      const totalSaidas    = saidas.filter((s) => s.produto === produto).reduce((s, e) => s + e.quantidade, 0);
      const saldoCalculado = totalEntradas - totalSaidas;

      // Soma de ajustes: (nova - anterior) por produto
      const ajustesProduto = ajustes.filter((a) => a.produto === produto);
      const deltaAjustes   = ajustesProduto.reduce((s, a) => s + (a.quantidadeNova - a.quantidadeAnterior), 0);

      return {
        produto,
        totalEntradas,
        totalSaidas,
        saldoCalculado,
        ajustes: deltaAjustes,
        saldoFinal: saldoCalculado + deltaAjustes,
      };
    });
  }, [entradas, saidas, ajustes]);

  /* ── Filtros ── */
  const inventarioFiltrado = useMemo(() => {
    return inventario.filter((linha) => {
      const mBusca = !busca || linha.produto.toLowerCase().includes(busca.toLowerCase());
      const mSaldo =
        filtroSaldo === "todos"  ? true :
        filtroSaldo === "zerado" ? linha.saldoFinal === 0 :
        filtroSaldo === "baixo"  ? linha.saldoFinal > 0 && linha.saldoFinal <= 5 :
        linha.saldoFinal > 5;
      return mBusca && mSaldo;
    });
  }, [inventario, busca, filtroSaldo]);

  /* ── Totais do resumo ── */
  const totalProdutos  = inventario.length;
  const totalUnidades  = inventario.reduce((s, l) => s + l.saldoFinal, 0);
  const produtosBaixo  = inventario.filter((l) => l.saldoFinal > 0 && l.saldoFinal <= 5).length;
  const produtosZerado = inventario.filter((l) => l.saldoFinal <= 0).length;

  /* ── Ajuste manual ── */
  function abrirAjuste(linha: LinhaInventario) {
    setProdutoAlvo(linha);
    setNovaQtd(String(linha.saldoFinal));
    setMotivoAjuste("");
    setErros({});
    setModalAjuste(true);
  }

  function validarAjuste(): boolean {
    const e: typeof erros = {};
    if (novaQtd === "" || Number(novaQtd) < 0) e.qtd    = "Informe uma quantidade válida (≥ 0)";
    if (!motivoAjuste)                          e.motivo = "Selecione um motivo";
    setErros(e);
    return Object.keys(e).length === 0;
  }

  function confirmarAjuste() {
    if (!produtoAlvo) return;
    const novo: Ajuste = {
      id:                 Date.now(),
      produto:            produtoAlvo.produto,
      quantidadeAnterior: produtoAlvo.saldoFinal,
      quantidadeNova:     Number(novaQtd),
      motivo:             motivoAjuste,
      data:               new Date().toISOString().split("T")[0],
    };
    const atualizados = [novo, ...ajustes];
    setLS("ajustes_estoque", atualizados);
    setAjustes(atualizados);
    setModalAjuste(false);
    setModalConfirma(false);
    setProdutoAlvo(null);
    setSucesso(`Ajuste de "${novo.produto}" registrado com sucesso!`);
  }

  function handleSolicitarAjuste() {
    if (!validarAjuste()) return;
    setModalAjuste(false);
    setModalConfirma(true);
  }

  /* ── Histórico ── */
  const ajustesHistorico = ajustes.filter((a) => a.produto === produtoHistorico);

  /* ── Badge de saldo ── */
  function saldoBadge(saldo: number) {
    if (saldo <= 0)  return { cls: "bg-red-500/10 text-red-400 border-red-500/20",       label: "Zerado"  };
    if (saldo <= 5)  return { cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", label: "Baixo" };
    return               { cls: "bg-green-500/10 text-green-400 border-green-500/20",    label: "OK"      };
  }

  return (
    <div className="w-full min-h-screen bg-secondary p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl text-white/50 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-1">Estoque</p>
              <h1 className="text-3xl font-black text-white tracking-tighter">Inventário</h1>
            </div>
          </div>
        </div>

        {/* ── Cards de resumo ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Produtos",        value: totalProdutos,  color: "text-white",        icon: <ClipboardList className="h-4 w-4" /> },
            { label: "Total unidades",  value: totalUnidades,  color: "text-cyan-400",     icon: <TrendingUp className="h-4 w-4" /> },
            { label: "Estoque baixo",   value: produtosBaixo,  color: "text-yellow-400",   icon: <Minus className="h-4 w-4" /> },
            { label: "Zerados",         value: produtosZerado, color: "text-red-400",       icon: <TrendingDown className="h-4 w-4" /> },
          ].map((c) => (
            <div key={c.label} className="bg-primary rounded-2xl border border-white/10 p-5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-xs font-semibold uppercase tracking-wide">{c.label}</span>
                <span className={`${c.color} opacity-60`}>{c.icon}</span>
              </div>
              <span className={`text-3xl font-black ${c.color}`}>{c.value}</span>
            </div>
          ))}
        </div>

        {/* ── Filtros ── */}
        <div className="bg-primary rounded-2xl border border-white/10 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
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
                onChange={(e) => setFiltroSaldo(e.target.value as typeof filtroSaldo)}
                className={selectClass}
              >
                <option value="todos"  className="bg-[#0f2f52]">Todos</option>
                <option value="ok"     className="bg-[#0f2f52]">OK (acima de 5)</option>
                <option value="baixo"  className="bg-[#0f2f52]">Baixo (1 a 5)</option>
                <option value="zerado" className="bg-[#0f2f52]">Zerado</option>
              </select>
            </Field>
          </div>

          {(busca || filtroSaldo !== "todos") && (
            <div className="flex justify-end">
              <button
                onClick={() => { setBusca(""); setFiltroSaldo("todos"); }}
                className="flex items-center gap-2 px-5 h-10 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 text-sm font-semibold transition-all active:scale-95"
              >
                <X className="h-4 w-4" /> Limpar
              </button>
            </div>
          )}
        </div>

        {/* ── Tabela ── */}
        <div className="bg-primary rounded-2xl border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <ClipboardList className="h-3 w-3" />
              </span>
              <h2 className="text-base font-bold text-white">Posição do Estoque</h2>
            </div>
            <span className="text-white/40 text-xs">
              {inventarioFiltrado.length} {inventarioFiltrado.length === 1 ? "produto" : "produtos"}
            </span>
          </div>

          {inventarioFiltrado.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <ClipboardList className="h-8 w-8 text-white/15" />
              <p className="text-white/30 text-sm">Nenhum produto encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="text-white/40 text-xs font-semibold text-left px-6 py-3">Produto</th>
                    <th className="text-white/40 text-xs font-semibold text-center px-4 py-3">Entradas</th>
                    <th className="text-white/40 text-xs font-semibold text-center px-4 py-3">Saídas</th>
                    <th className="text-white/40 text-xs font-semibold text-center px-4 py-3">Saldo Calc.</th>
                    <th className="text-white/40 text-xs font-semibold text-center px-4 py-3">Ajustes</th>
                    <th className="text-white/40 text-xs font-semibold text-center px-4 py-3">Saldo Final</th>
                    <th className="text-white/40 text-xs font-semibold text-center px-4 py-3">Status</th>
                    <th className="text-white/40 text-xs font-semibold text-center px-6 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {inventarioFiltrado.map((linha) => {
                    const badge = saldoBadge(linha.saldoFinal);
                    return (
                      <tr key={linha.produto} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-white font-medium">{linha.produto}</td>
                        <td className="px-4 py-4 text-center text-green-400 font-semibold">
                          +{linha.totalEntradas}
                        </td>
                        <td className="px-4 py-4 text-center text-red-400 font-semibold">
                          -{linha.totalSaidas}
                        </td>
                        <td className="px-4 py-4 text-center text-white/60 font-mono">
                          {linha.saldoCalculado}
                        </td>
                        <td className="px-4 py-4 text-center font-mono">
                          {linha.ajustes === 0 ? (
                            <span className="text-white/30">—</span>
                          ) : (
                            <span className={linha.ajustes > 0 ? "text-cyan-400" : "text-orange-400"}>
                              {linha.ajustes > 0 ? "+" : ""}{linha.ajustes}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center text-white font-black text-base">
                          {linha.saldoFinal}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => abrirAjuste(linha)}
                              className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold transition-all active:scale-95"
                            >
                              <SlidersHorizontal className="h-3 w-3" /> Ajustar
                            </button>
                            <button
                              onClick={() => { setProdutoHistorico(linha.produto); setModalHistorico(true); }}
                              className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-xs font-semibold transition-all active:scale-95"
                            >
                              <ClipboardList className="h-3 w-3" /> Histórico
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

      {/* ── MODAL AJUSTE ── */}
      {modalAjuste && produtoAlvo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-primary w-full max-w-md rounded-2xl border border-white/10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <SlidersHorizontal className="h-3 w-3" />
                </span>
                <h2 className="text-base font-bold text-white">Ajuste Manual</h2>
              </div>
              <button onClick={() => setModalAjuste(false)} className="text-white/30 hover:text-white/70 transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Info do produto */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-1">Produto</p>
                  <p className="text-white font-bold">{produtoAlvo.produto}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-1">Saldo atual</p>
                  <p className="text-2xl font-black text-white">{produtoAlvo.saldoFinal}</p>
                </div>
              </div>

              <Field label="Nova quantidade" required>
                <input
                  type="number" min={0}
                  value={novaQtd}
                  onChange={(e) => setNovaQtd(e.target.value)}
                  placeholder="0"
                  className={`${inputClass} ${erros.qtd ? "border-red-400/50" : ""}`}
                />
                {erros.qtd && <p className="text-red-400 text-xs">{erros.qtd}</p>}
                {novaQtd !== "" && Number(novaQtd) !== produtoAlvo.saldoFinal && (
                  <p className={`text-xs font-semibold mt-1 ${Number(novaQtd) > produtoAlvo.saldoFinal ? "text-green-400" : "text-orange-400"}`}>
                    {Number(novaQtd) > produtoAlvo.saldoFinal
                      ? `+${Number(novaQtd) - produtoAlvo.saldoFinal} unidades`
                      : `${Number(novaQtd) - produtoAlvo.saldoFinal} unidades`}
                  </p>
                )}
              </Field>

              <Field label="Motivo" required>
                <select
                  value={motivoAjuste}
                  onChange={(e) => setMotivoAjuste(e.target.value)}
                  className={`${selectClass} ${erros.motivo ? "border-red-400/50" : ""}`}
                >
                  <option value="" className="bg-[#0f2f52]">Selecione...</option>
                  {MOTIVOS_AJUSTE.map((m) => (
                    <option key={m} value={m} className="bg-[#0f2f52]">{m}</option>
                  ))}
                </select>
                {erros.motivo && <p className="text-red-400 text-xs">{erros.motivo}</p>}
              </Field>
            </div>

            <div className="flex justify-end gap-3 px-6 pb-6 border-t border-white/10 pt-4">
              <button
                onClick={() => setModalAjuste(false)}
                className="px-5 h-10 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 text-sm font-semibold transition-all active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={handleSolicitarAjuste}
                className="px-6 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-bold transition-all active:scale-95"
              >
                Revisar ajuste
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CONFIRMAÇÃO AJUSTE ── */}
      {modalConfirma && produtoAlvo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-primary w-full max-w-sm rounded-2xl border border-white/10 p-6 space-y-5">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-cyan-400" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-white font-bold text-lg">Confirmar ajuste?</h2>
              <p className="text-white/50 text-sm">Esta operação ficará registrada no histórico.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Produto</span>
                <span className="text-white font-semibold">{produtoAlvo.produto}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Saldo anterior</span>
                <span className="text-white font-mono">{produtoAlvo.saldoFinal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Novo saldo</span>
                <span className={`font-mono font-bold ${Number(novaQtd) >= produtoAlvo.saldoFinal ? "text-green-400" : "text-orange-400"}`}>
                  {novaQtd}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Motivo</span>
                <span className="text-white/80">{motivoAjuste}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => { setModalConfirma(false); setModalAjuste(true); }}
                className="flex-1 h-10 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 text-sm font-semibold transition-all active:scale-95"
              >
                Voltar
              </button>
              <button
                onClick={confirmarAjuste}
                className="flex-1 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-bold transition-all active:scale-95"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL HISTÓRICO ── */}
      {modalHistorico && produtoHistorico && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-primary w-full max-w-lg rounded-2xl border border-white/10 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <ClipboardList className="h-3 w-3" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-white">Histórico de Ajustes</h2>
                  <p className="text-white/40 text-xs">{produtoHistorico}</p>
                </div>
              </div>
              <button onClick={() => setModalHistorico(false)} className="text-white/30 hover:text-white/70 transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {ajustesHistorico.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <ClipboardList className="h-8 w-8 text-white/15" />
                  <p className="text-white/30 text-sm">Nenhum ajuste registrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ajustesHistorico.map((aj) => {
                    const delta = aj.quantidadeNova - aj.quantidadeAnterior;
                    return (
                      <div key={aj.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
                        <div className="space-y-1 flex-1 min-w-0">
                          <p className="text-white text-sm font-semibold">{aj.motivo}</p>
                          <p className="text-white/40 text-xs font-mono">
                            {new Date(aj.data + "T00:00:00").toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-white/50 text-xs mb-1">
                            {aj.quantidadeAnterior} → {aj.quantidadeNova}
                          </p>
                          <span className={`text-sm font-black ${delta > 0 ? "text-green-400" : delta < 0 ? "text-orange-400" : "text-white/40"}`}>
                            {delta > 0 ? "+" : ""}{delta}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SUCESSO ── */}
      {sucesso && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-primary w-full max-w-xs rounded-2xl border border-white/10 p-6 space-y-4 text-center">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-green-400" />
              </div>
            </div>
            <h2 className="text-white font-bold text-base">{sucesso}</h2>
            <p className="text-xs text-white/30">Fechando automaticamente…</p>
          </div>
        </div>
      )}
    </div>
  );
}