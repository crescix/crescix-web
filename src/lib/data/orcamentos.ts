/**
 * Re-exports do service + helpers de display.
 *
 * O mock orcamentosData foi removido — os dados vêm da API agora via
 * listOrcamentos / getOrcamento.
 */

export type {
  Orcamento,
  OrcamentoCreate,
  OrcamentoUpdate,
  OrcamentoQuery,
  ItemOrcamento,
  ItemOrcamentoInput,
} from "@/services/orcamentos";

import type { StatusOrcamento } from "@/services/api/enums";
export type { StatusOrcamento } from "@/services/api/enums";

/**
 * Mapa de display: backend usa enum maiúsculo, UI mostra com acentuação.
 */
export const STATUS_ORCAMENTO_LABEL: Record<StatusOrcamento, string> = {
  ABERTO: "Aberto",
  APROVADO: "Aprovado",
  RECUSADO: "Recusado",
  EXPIRADO: "Expirado",
};

export const STATUS_ORCAMENTO_OPTIONS: StatusOrcamento[] = [
  "ABERTO",
  "APROVADO",
  "RECUSADO",
  "EXPIRADO",
];

/**
 * Cores dos status para badges/tabelas.
 */
export const STATUS_ORCAMENTO_STYLES: Record<StatusOrcamento, string> = {
  ABERTO:   "bg-amber-500/15 text-amber-400 border-amber-500/25",
  APROVADO: "bg-green-500/15 text-green-400 border-green-500/25",
  RECUSADO: "bg-red-500/15 text-red-400 border-red-500/25",
  EXPIRADO: "bg-white/10 text-white/40 border-white/15",
};

/**
 * Converte string ISO ("2026-05-16" ou "2026-05-16T00:00:00.000Z") para
 * formato "DD/MM/YYYY" pra exibir.
 */
export function isoToDisplay(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = iso.split("T")[0].split(" ")[0];
  const [y, m, d] = date.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

/**
 * Converte ISO completa para "YYYY-MM-DD" pro input type="date".
 */
export function isoToInputDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.split("T")[0];
}

/**
 * Sugere o próximo número sequencial baseado nos orçamentos existentes.
 * Ex.: já existe #ORC-0001 e #ORC-0002 → retorna #ORC-0003
 */
export function nextOrcamentoNumero(existentes: { numero: string }[]): string {
  const numeros = existentes
    .map((o) => {
      const match = o.numero.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => n > 0);
  const next = numeros.length === 0 ? 1 : Math.max(...numeros) + 1;
  return `#ORC-${String(next).padStart(4, "0")}`;
}
