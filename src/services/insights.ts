import { api } from "./api/axios-config";

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS — espelham o que a crescix-api retorna em /insights/mensal* (ver
// src/lib/insight-aggregator.ts e src/lib/insight-ai.ts no backend).
// ─────────────────────────────────────────────────────────────────────────────

export interface InsightPeriodo {
  ano: number;
  mes: number;
  label: string;
  from: string; // ISO date (YYYY-MM-DD)
  to: string;
}

export interface InsightResumo {
  entradas: number;
  saidas: number;
  saldo: number;
  totalContasReceber: number;
  totalContasPagar: number;
}

export interface InsightComparativo {
  entradas: number;
  saidas: number;
  saldo: number;
  variacaoEntradas: number | null;
  variacaoSaidas: number | null;
  variacaoSaldo: number | null;
}

export interface TopVendido {
  descricao: string;
  quantidade: number;
  valorTotal: number;
}

export interface TopDespesa {
  descricao: string;
  categoria: string;
  quantidade: number;
  valorTotal: number;
}

export interface CategoriaResumo {
  categoria: string;
  total: number;
  quantidade: number;
}

export interface AgregadoMensal {
  periodo: InsightPeriodo;
  resumo: InsightResumo;
  comparativoMesAnterior: InsightComparativo;
  topVendidos: TopVendido[];
  topDespesas: TopDespesa[];
  receitasPorCategoria: CategoriaResumo[];
  despesasPorCategoria: CategoriaResumo[];
}

// IA payload ────────────────────────────────────────────────────────────────

export interface InsightObservacao {
  titulo: string;
  descricao: string;
}

export interface InsightSugestao {
  titulo: string;
  descricao: string;
  prioridade: "alta" | "media" | "baixa";
}

export interface InsightAlerta {
  titulo: string;
  descricao: string;
  severidade: "alta" | "media";
}

export interface InsightsPayload {
  resumoExecutivo: string;
  observacoes: InsightObservacao[];
  sugestoes: InsightSugestao[];
  alertas: InsightAlerta[];
}

export interface CacheInfo {
  hit: boolean;
  geradoEm: string; // ISO datetime
  modelo: string;
}

export interface SugestoesResponse {
  agregado: AgregadoMensal;
  insights: InsightsPayload;
  cache: CacheInfo;
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAMADAS
// ─────────────────────────────────────────────────────────────────────────────

interface PeriodoParams {
  ano?: number;
  mes?: number;
}

/**
 * Agregado puro do mês. Não chama IA, sempre rápido.
 * Quando ano/mes omitidos, retorna o mês ANTERIOR ao atual.
 */
export async function getInsightMensal(params: PeriodoParams = {}): Promise<AgregadoMensal> {
  const { data } = await api.get<AgregadoMensal>("/insights/mensal", { params });
  return data;
}

/**
 * Agregado + sugestões da IA (com cache). Pode demorar 5-15s na 1a chamada
 * do mês. Configure timeout maior no axios pra essa rota se necessário.
 *
 * Erros previsíveis:
 *  - 503: OPENAI_API_KEY ausente no servidor
 *  - 502: IA falhou
 */
export async function getInsightSugestoes(params: PeriodoParams = {}): Promise<SugestoesResponse> {
  const { data } = await api.get<SugestoesResponse>("/insights/mensal/sugestoes", {
    params,
    // IA pode demorar; deixa folga de 60s. Axios default sobe interceptors,
    // mas timeout local não passa por eles.
    timeout: 60_000,
  });
  return data;
}

/**
 * Invalida o cache de sugestões pra (ano, mes). Idempotente — não erra se
 * não houver cache.
 */
export async function deleteInsightSugestoes(params: PeriodoParams = {}): Promise<{ deleted: boolean }> {
  const { data } = await api.delete<{ deleted: boolean }>("/insights/mensal/sugestoes", { params });
  return data;
}
