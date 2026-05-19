/**
 * Re-exports do service de movimentos de estoque + helpers de display.
 *
 * IMPORTANTE: Movimentos são imutáveis no backend. Não há endpoint
 * PATCH/UPDATE. Para corrigir, lance um movimento compensatório (de
 * ajuste manual) ou exclua e crie um novo.
 */

export type {
  MovimentoEstoque,
  MovimentoEstoqueCreate,
  MovimentoEstoqueQuery,
} from "@/services/movimentos-estoque";

import type { TipoMovimento, MotivoMovimento } from "@/services/api/enums";

export type { TipoMovimento, MotivoMovimento } from "@/services/api/enums";

export const TIPO_MOVIMENTO_LABEL: Record<TipoMovimento, string> = {
  ENTRADA: "Entrada",
  SAIDA:   "Saída",
};

export const MOTIVO_MOVIMENTO_LABEL: Record<MotivoMovimento, string> = {
  COMPRA:           "Compra",
  VENDA:            "Venda",
  CONSUMO_INTERNO:  "Consumo Interno",
  DEVOLUCAO:        "Devolução",
  PERDA_AVARIA:     "Perda / Avaria",
  AJUSTE_MANUAL:    "Ajuste Manual",
  OUTROS:           "Outros",
};

/**
 * Motivos disponíveis numa entrada (estoque crescendo).
 */
export const MOTIVO_ENTRADA_OPTIONS: MotivoMovimento[] = [
  "COMPRA",
  "DEVOLUCAO",
  "AJUSTE_MANUAL",
  "OUTROS",
];

/**
 * Motivos disponíveis numa saída (estoque diminuindo).
 */
export const MOTIVO_SAIDA_OPTIONS: MotivoMovimento[] = [
  "VENDA",
  "CONSUMO_INTERNO",
  "PERDA_AVARIA",
  "AJUSTE_MANUAL",
  "OUTROS",
];

export const MOTIVO_MOVIMENTO_STYLES: Record<MotivoMovimento, string> = {
  COMPRA:           "bg-green-500/10 text-green-400 border-green-500/25",
  VENDA:            "bg-blue-500/10 text-blue-400 border-blue-500/25",
  CONSUMO_INTERNO:  "bg-amber-500/10 text-amber-400 border-amber-500/25",
  DEVOLUCAO:        "bg-purple-500/10 text-purple-400 border-purple-500/25",
  PERDA_AVARIA:     "bg-red-500/10 text-red-400 border-red-500/25",
  AJUSTE_MANUAL:    "bg-cyan-500/10 text-cyan-400 border-cyan-500/25",
  OUTROS:           "bg-white/10 text-white/60 border-white/20",
};

/**
 * Converte ISO completo para "DD/MM/YYYY".
 */
export function formatDateBR(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = iso.split("T")[0].split(" ")[0];
  const [y, m, d] = date.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

/**
 * Formata valor decimal (string ou number) como BRL.
 */
export function formatBRL(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? Number(value) : (value ?? 0);
  if (!Number.isFinite(n)) return "R$ 0,00";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
