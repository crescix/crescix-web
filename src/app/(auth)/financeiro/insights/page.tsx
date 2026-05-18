"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Sparkles,
    RefreshCw,
    AlertCircle,
    AlertTriangle,
    Lightbulb,
    TrendingUp,
    TrendingDown,
    Wallet,
    Minus,
    Loader2,
    ChevronRight,
} from "lucide-react";
import {
    getInsightSugestoes,
    deleteInsightSugestoes,
    type SugestoesResponse,
} from "@/services/insights";
import { extractApiError } from "@/lib/utils/api-errors";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function fmtBRL(n: number): string {
    return n.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function fmtPct(v: number | null): string {
    if (v === null) return "—";
    if (v === 0) return "0%";
    const pct = (v * 100).toFixed(1).replace(".", ",");
    return v > 0 ? `+${pct}%` : `${pct}%`;
}

function fmtDataHora(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

const LABEL_CATEGORIA_PAGAR: Record<string, string> = {
    FORNECEDOR: "Fornecedor",
    ALUGUEL: "Aluguel",
    ENERGIA: "Energia",
    AGUA: "Água",
    INTERNET_TELEFONIA: "Internet/Telefone",
    SALARIOS: "Salários",
    IMPOSTOS: "Impostos",
    MARKETING: "Marketing",
    MANUTENCAO: "Manutenção",
    OUTROS: "Outros",
};

const LABEL_CATEGORIA_RECEBER: Record<string, string> = {
    VENDA: "Venda",
    SERVICO: "Serviço",
    COMISSAO: "Comissão",
    REEMBOLSO: "Reembolso",
    OUTROS: "Outros",
};

const COR_PRIORIDADE: Record<string, string> = {
    alta: "border-red-400/40 bg-red-400/5",
    media: "border-amber-400/40 bg-amber-400/5",
    baixa: "border-brand/30 bg-brand/5",
};

const ICONE_PRIORIDADE: Record<string, string> = {
    alta: "🔴",
    media: "🟡",
    baixa: "🟢",
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS DE PERÍODO
// ─────────────────────────────────────────────────────────────────────────────
// Cria opções dos últimos 12 meses pra um <select>. Default selecionado é o
// mês ANTERIOR ao atual — coerente com o default da API.

interface OpcaoMes {
    value: string;        // "2026-04"
    label: string;        // "abril de 2026"
    ano: number;
    mes: number;          // 1-12
}

const NOMES_MES = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function gerarOpcoesMeses(): OpcaoMes[] {
    const hoje = new Date();
    const opcoes: OpcaoMes[] = [];
    // Começa pelo mês anterior (i=1) e volta 12 meses.
    for (let i = 1; i <= 12; i++) {
        const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const ano = d.getFullYear();
        const mes = d.getMonth() + 1;
        opcoes.push({
            value: `${ano}-${String(mes).padStart(2, "0")}`,
            label: `${NOMES_MES[mes - 1]} de ${ano}`,
            ano,
            mes,
        });
    }
    return opcoes;
}

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA
// ─────────────────────────────────────────────────────────────────────────────

export default function InsightsPage() {
    const opcoes = useMemo(gerarOpcoesMeses, []);
    const [selecionado, setSelecionado] = useState<string>(opcoes[0]!.value);
    const [data, setData] = useState<SugestoesResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<{ status?: number; message: string } | null>(null);
    const [refazendo, setRefazendo] = useState(false);

    const opcaoAtiva = opcoes.find((o) => o.value === selecionado) || opcoes[0]!;

    const carregar = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const resp = await getInsightSugestoes({
                ano: opcaoAtiva.ano,
                mes: opcaoAtiva.mes,
            });
            setData(resp);
        } catch (err: unknown) {
            const e = err as { response?: { status?: number }; code?: string; message?: string };
            const status = e.response?.status;
            const isTimeout =
                e.code === "ECONNABORTED" ||
                (typeof e.message === "string" && e.message.includes("timeout"));
            setError({
                status,
                message: isTimeout
                    ? "A análise demorou demais. Tente novamente em alguns instantes."
                    : extractApiError(err, "Não consegui gerar a análise agora."),
            });
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [opcaoAtiva.ano, opcaoAtiva.mes]);

    useEffect(() => {
        carregar();
    }, [carregar]);

    const handleRefazer = async () => {
        if (refazendo) return;
        setRefazendo(true);
        try {
            await deleteInsightSugestoes({
                ano: opcaoAtiva.ano,
                mes: opcaoAtiva.mes,
            });
            await carregar();
        } catch (err) {
            setError({
                message: extractApiError(err, "Não consegui refazer a análise agora."),
            });
        } finally {
            setRefazendo(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-secondary p-4 md:p-8 flex flex-col items-center">
            <div className="w-full max-w-6xl space-y-6">

                {/* ── Cabeçalho ──────────────────────────────────────────── */}
                <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-brand/15 border border-brand/25 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="h-5 w-5 text-brand" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-brand font-semibold mb-1">
                                Análise IA
                            </p>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter">
                                Insights mensais
                            </h1>
                            <p className="text-white/50 text-sm mt-0.5">
                                Resumo, observações e sugestões geradas pela IA com base nos seus números.
                            </p>
                        </div>
                    </div>

                    {/* Controles: seletor + refazer */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <select
                            value={selecionado}
                            onChange={(e) => setSelecionado(e.target.value)}
                            disabled={loading || refazendo}
                            className="
                                h-10 px-3 pr-9
                                bg-primary border border-white/10
                                rounded-lg
                                text-white text-sm
                                appearance-none
                                bg-no-repeat bg-right
                                focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/15
                                disabled:opacity-60
                                transition-colors
                            "
                            style={{
                                backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23ffffff80' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
                                backgroundPosition: "right 10px center",
                            }}
                        >
                            {opcoes.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={handleRefazer}
                            disabled={loading || refazendo || !data}
                            title="Refazer análise (depois de lançar algo retroativo)"
                            className="
                                h-10 px-3.5
                                inline-flex items-center gap-2
                                bg-primary border border-white/10
                                hover:bg-white/5 hover:border-white/15
                                rounded-lg
                                text-white/70 text-sm
                                transition-colors
                                disabled:opacity-50 disabled:cursor-not-allowed
                            "
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${refazendo ? "animate-spin" : ""}`} />
                            <span className="hidden sm:inline">Refazer</span>
                        </button>
                    </div>
                </header>

                {/* ── Estados ────────────────────────────────────────────── */}
                {loading && <LoadingState />}
                {!loading && error && <ErrorState error={error} onRetry={carregar} />}
                {!loading && !error && data && (
                    <Conteudo data={data} mesLabel={opcaoAtiva.label} />
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBCOMPONENTES
// ─────────────────────────────────────────────────────────────────────────────

function LoadingState() {
    return (
        <div className="bg-primary border border-white/10 rounded-2xl p-10 md:p-14 flex flex-col items-center text-center">
            <div className="relative">
                <div className="h-16 w-16 rounded-full bg-brand/10 flex items-center justify-center">
                    <Loader2 className="h-7 w-7 text-brand animate-spin" />
                </div>
                <div className="absolute inset-0 rounded-full bg-brand/15 blur-xl -z-10" />
            </div>
            <h2 className="mt-5 text-lg font-bold text-white">
                Gerando análise...
            </h2>
            <p className="mt-1.5 text-sm text-white/55 max-w-md">
                A IA está revisando seus números, comparando com o mês anterior e
                montando as observações. Pode levar até 30 segundos na primeira
                vez do mês.
            </p>
        </div>
    );
}

function ErrorState({
    error,
    onRetry,
}: {
    error: { status?: number; message: string };
    onRetry: () => void;
}) {
    const isKeyMissing = error.status === 503;
    return (
        <div className="bg-primary border border-red-400/30 rounded-2xl p-8 flex flex-col items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-white">
                    {isKeyMissing
                        ? "Análise por IA não está disponível"
                        : "Não consegui gerar a análise"}
                </h2>
                <p className="mt-1.5 text-sm text-white/55 max-w-xl">
                    {isKeyMissing
                        ? "O administrador do servidor precisa configurar a chave da OpenAI (OPENAI_API_KEY) pra ativar essa tela. Os relatórios e o fluxo de caixa continuam funcionando normalmente."
                        : error.message}
                </p>
            </div>
            {!isKeyMissing && (
                <button
                    onClick={onRetry}
                    className="
                        mt-1 inline-flex items-center gap-2
                        h-9 px-3.5
                        bg-brand hover:bg-brand-strong
                        text-white text-sm font-semibold
                        rounded-lg transition-colors
                    "
                >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Tentar novamente
                </button>
            )}
        </div>
    );
}

function Conteudo({ data, mesLabel }: { data: SugestoesResponse; mesLabel: string }) {
    const { agregado, insights, cache } = data;
    const { resumo, comparativoMesAnterior } = agregado;

    return (
        <>
            {/* ── KPIs principais ─────────────────────────────────────── */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <KpiVariacao
                    label="Entradas"
                    valor={resumo.entradas}
                    variacao={comparativoMesAnterior.variacaoEntradas}
                    valorPrev={comparativoMesAnterior.entradas}
                    bom="cima"
                />
                <KpiVariacao
                    label="Saídas"
                    valor={resumo.saidas}
                    variacao={comparativoMesAnterior.variacaoSaidas}
                    valorPrev={comparativoMesAnterior.saidas}
                    bom="baixo"
                />
                <KpiVariacao
                    label="Saldo"
                    valor={resumo.saldo}
                    variacao={comparativoMesAnterior.variacaoSaldo}
                    valorPrev={comparativoMesAnterior.saldo}
                    bom="cima"
                    destaque
                />
            </section>

            {/* ── Resumo executivo (IA) ───────────────────────────────── */}
            {insights.resumoExecutivo && (
                <section className="relative overflow-hidden bg-gradient-to-br from-brand/10 via-brand/5 to-transparent border border-brand/25 rounded-3xl p-6 md:p-8">
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-brand flex-shrink-0 mt-1" />
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-brand font-semibold mb-1.5">
                                Resumo do mês — {mesLabel}
                            </p>
                            <p className="text-white text-base md:text-lg leading-relaxed">
                                {insights.resumoExecutivo}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* ── Grade principal: IA à esquerda + Dados à direita ────── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-6">

                {/* ── Coluna IA: observações + sugestões + alertas ────────── */}
                <div className="space-y-6">
                    {insights.observacoes.length > 0 && (
                        <Painel
                            titulo="O que aconteceu"
                            icon={<TrendingUp className="h-4 w-4 text-brand" />}
                        >
                            <div className="space-y-2.5">
                                {insights.observacoes.map((o, i) => (
                                    <ItemSimples
                                        key={i}
                                        titulo={o.titulo}
                                        descricao={o.descricao}
                                    />
                                ))}
                            </div>
                        </Painel>
                    )}

                    {insights.sugestoes.length > 0 && (
                        <Painel
                            titulo="Sugestões pra próximo mês"
                            icon={<Lightbulb className="h-4 w-4 text-amber-400" />}
                        >
                            <div className="space-y-2.5">
                                {insights.sugestoes.map((s, i) => (
                                    <div
                                        key={i}
                                        className={`p-3.5 rounded-xl border ${COR_PRIORIDADE[s.prioridade] || COR_PRIORIDADE.media}`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <span className="text-base flex-shrink-0 leading-none">
                                                {ICONE_PRIORIDADE[s.prioridade] || ICONE_PRIORIDADE.media}
                                            </span>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-white">
                                                    {s.titulo}
                                                </p>
                                                <p className="text-xs text-white/65 mt-1 leading-relaxed">
                                                    {s.descricao}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Painel>
                    )}

                    {insights.alertas.length > 0 && (
                        <Painel
                            titulo="Atenção"
                            icon={<AlertTriangle className="h-4 w-4 text-red-400" />}
                        >
                            <div className="space-y-2.5">
                                {insights.alertas.map((a, i) => (
                                    <div
                                        key={i}
                                        className={`p-3.5 rounded-xl border ${
                                            a.severidade === "alta"
                                                ? "border-red-400/40 bg-red-400/5"
                                                : "border-amber-400/40 bg-amber-400/5"
                                        }`}
                                    >
                                        <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                                            <span className="text-base leading-none">
                                                {a.severidade === "alta" ? "🚨" : "⚠️"}
                                            </span>
                                            {a.titulo}
                                        </p>
                                        <p className="text-xs text-white/65 mt-1 leading-relaxed">
                                            {a.descricao}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Painel>
                    )}
                </div>

                {/* ── Coluna direita: top vendidos / top despesas / categorias ─ */}
                <div className="space-y-6">
                    {agregado.topVendidos.length > 0 && (
                        <Painel
                            titulo="Top vendidos"
                            icon={<TrendingUp className="h-4 w-4 text-brand" />}
                            subtitulo={`${agregado.topVendidos.length} itens`}
                        >
                            <ListaItens
                                itens={agregado.topVendidos.map((v) => ({
                                    rotulo: v.descricao,
                                    secundario: `${v.quantidade}x`,
                                    valor: v.valorTotal,
                                    corValor: "text-brand",
                                }))}
                                total={agregado.resumo.entradas}
                            />
                        </Painel>
                    )}

                    {agregado.topDespesas.length > 0 && (
                        <Painel
                            titulo="Top despesas"
                            icon={<TrendingDown className="h-4 w-4 text-red-400" />}
                            subtitulo={`${agregado.topDespesas.length} itens`}
                        >
                            <ListaItens
                                itens={agregado.topDespesas.map((d) => ({
                                    rotulo: d.descricao,
                                    secundario: LABEL_CATEGORIA_PAGAR[d.categoria] || d.categoria,
                                    valor: d.valorTotal,
                                    corValor: "text-red-300",
                                }))}
                                total={agregado.resumo.saidas}
                            />
                        </Painel>
                    )}

                    {(agregado.despesasPorCategoria.length > 0 ||
                        agregado.receitasPorCategoria.length > 0) && (
                        <Painel
                            titulo="Por categoria"
                            icon={<ChevronRight className="h-4 w-4 text-white/40" />}
                        >
                            <div className="space-y-5">
                                {agregado.receitasPorCategoria.length > 0 && (
                                    <BarrasCategoria
                                        titulo="Entradas"
                                        cor="bg-brand"
                                        itens={agregado.receitasPorCategoria.map((c) => ({
                                            rotulo: LABEL_CATEGORIA_RECEBER[c.categoria] || c.categoria,
                                            valor: c.total,
                                        }))}
                                    />
                                )}
                                {agregado.despesasPorCategoria.length > 0 && (
                                    <BarrasCategoria
                                        titulo="Saídas"
                                        cor="bg-red-400"
                                        itens={agregado.despesasPorCategoria.map((c) => ({
                                            rotulo: LABEL_CATEGORIA_PAGAR[c.categoria] || c.categoria,
                                            valor: c.total,
                                        }))}
                                    />
                                )}
                            </div>
                        </Painel>
                    )}
                </div>
            </div>

            {/* ── Rodapé: cache info ──────────────────────────────────── */}
            <footer className="flex items-center justify-between text-xs text-white/35 px-1 pt-2">
                <span>
                    {cache.hit ? "Análise do cache " : "Análise gerada agora "}
                    em <span className="text-white/55">{fmtDataHora(cache.geradoEm)}</span>
                </span>
                <span className="font-mono">{cache.modelo}</span>
            </footer>
        </>
    );
}

// ─── KPI com variação vs mês anterior ──────────────────────────────────────

function KpiVariacao({
    label,
    valor,
    variacao,
    valorPrev,
    bom,
    destaque,
}: {
    label: string;
    valor: number;
    variacao: number | null;
    valorPrev: number;
    bom: "cima" | "baixo";  // "cima" = subir é bom (verde se positivo)
    destaque?: boolean;
}) {
    // Determina cor da variação. Pra "saídas", subir é ruim (vermelho).
    const subiuEhBom = bom === "cima";
    const corVariacao =
        variacao === null || variacao === 0
            ? "text-white/40"
            : (variacao > 0) === subiuEhBom
                ? "text-brand"
                : "text-red-300";

    // Saldo: cor do valor principal depende se positivo ou negativo
    const isSaldo = label === "Saldo";
    const corValor = isSaldo
        ? valor >= 0 ? "text-brand" : "text-red-300"
        : "text-white";

    const Icon =
        variacao === null || variacao === 0
            ? Minus
            : variacao > 0
                ? TrendingUp
                : TrendingDown;

    return (
        <div
            className={`
                bg-primary border rounded-2xl p-5
                ${destaque ? "border-brand/30 bg-gradient-to-br from-brand/5 to-transparent" : "border-white/10"}
            `}
        >
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-white/45 uppercase tracking-wider font-medium">
                    {label}
                </p>
                {isSaldo && (
                    <div className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center">
                        <Wallet className="h-3.5 w-3.5 text-white/60" />
                    </div>
                )}
            </div>
            <p className={`text-2xl md:text-3xl font-bold ${corValor}`}>
                {fmtBRL(valor)}
            </p>
            <div className={`mt-2 inline-flex items-center gap-1 text-xs ${corVariacao}`}>
                <Icon className="h-3.5 w-3.5" />
                <span className="font-semibold">{fmtPct(variacao)}</span>
                <span className="text-white/40 ml-1">
                    vs {fmtBRL(valorPrev).replace("R$ ", "R$ ")}
                </span>
            </div>
        </div>
    );
}

// ─── Painel genérico ─────────────────────────────────────────────────────

function Painel({
    titulo,
    icon,
    subtitulo,
    children,
}: {
    titulo: string;
    icon?: React.ReactNode;
    subtitulo?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="bg-primary border border-white/10 rounded-2xl p-5">
            <header className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {icon}
                    {titulo}
                </h3>
                {subtitulo && (
                    <span className="text-[11px] text-white/40 font-mono">
                        {subtitulo}
                    </span>
                )}
            </header>
            {children}
        </section>
    );
}

function ItemSimples({ titulo, descricao }: { titulo: string; descricao: string }) {
    return (
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
            <p className="text-sm font-semibold text-white">{titulo}</p>
            <p className="text-xs text-white/60 mt-1 leading-relaxed">{descricao}</p>
        </div>
    );
}

function ListaItens({
    itens,
    total,
}: {
    itens: { rotulo: string; secundario?: string; valor: number; corValor: string }[];
    total: number;
}) {
    return (
        <ul className="space-y-2.5">
            {itens.map((it, i) => {
                const pct = total > 0 ? Math.round((it.valor / total) * 100) : 0;
                return (
                    <li key={i} className="space-y-1">
                        <div className="flex items-baseline justify-between gap-2">
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-white truncate">
                                    {it.rotulo}
                                </p>
                                {it.secundario && (
                                    <p className="text-[11px] text-white/40 mt-0.5">
                                        {it.secundario}
                                    </p>
                                )}
                            </div>
                            <p className={`text-sm font-bold font-mono ${it.corValor}`}>
                                {fmtBRL(it.valor)}
                            </p>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${it.corValor.includes("red") ? "bg-red-400/60" : "bg-brand/60"}`}
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}

function BarrasCategoria({
    titulo,
    cor,
    itens,
}: {
    titulo: string;
    cor: string;
    itens: { rotulo: string; valor: number }[];
}) {
    const max = Math.max(...itens.map((i) => i.valor), 1);
    return (
        <div>
            <p className="text-[11px] uppercase tracking-wider text-white/40 font-medium mb-2.5">
                {titulo}
            </p>
            <div className="space-y-2">
                {itens.map((it, i) => (
                    <div key={i}>
                        <div className="flex items-baseline justify-between gap-2 mb-1">
                            <span className="text-xs text-white/75">{it.rotulo}</span>
                            <span className="text-xs font-mono text-white/55">
                                {fmtBRL(it.valor)}
                            </span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${cor} opacity-70`}
                                style={{ width: `${Math.round((it.valor / max) * 100)}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
