/**
 * Re-exports do service + helpers de display dos Pedidos.
 *
 * O mock pedidosData foi removido — agora os dados vêm da API via
 * listPedidos / getPedido.
 */

export type {
  Pedido,
  PedidoCreate,
  PedidoUpdate,
  PedidoQuery,
  ItemPedido,
  ItemPedidoInput,
} from "@/services/pedidos";

import type { StatusPedido, CondicaoPagamento } from "@/services/api/enums";
export type { StatusPedido, CondicaoPagamento } from "@/services/api/enums";

/**
 * Display labels do enum.
 */
export const STATUS_PEDIDO_LABEL: Record<StatusPedido, string> = {
  FATURADO:  "Faturado",
  PENDENTE:  "Pendente",
  ORCAMENTO: "Orçamento",
  CANCELADO: "Cancelado",
};

export const STATUS_PEDIDO_OPTIONS: StatusPedido[] = [
  "FATURADO",
  "PENDENTE",
  "ORCAMENTO",
  "CANCELADO",
];

export const STATUS_PEDIDO_STYLES: Record<StatusPedido, string> = {
  FATURADO:  "bg-green-500/15 text-green-400 border-green-500/25",
  PENDENTE:  "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  ORCAMENTO: "bg-slate-500/15 text-slate-400 border-slate-500/25",
  CANCELADO: "bg-red-500/15 text-red-400 border-red-500/25",
};

export const CONDICAO_PAGAMENTO_LABEL: Record<CondicaoPagamento, string> = {
  A_VISTA:       "À Vista",
  CARTAO_2X:     "Cartão 2x",
  CARTAO_3X:     "Cartão 3x",
  CARTAO_5X:     "Cartão 5x",
  BOLETO:        "Boleto",
  PIX:           "Pix",
  TRANSFERENCIA: "Transferência",
  OUTROS:        "Outros",
};

export const CONDICAO_PAGAMENTO_OPTIONS: CondicaoPagamento[] = [
  "A_VISTA",
  "PIX",
  "CARTAO_2X",
  "CARTAO_3X",
  "CARTAO_5X",
  "BOLETO",
  "TRANSFERENCIA",
  "OUTROS",
];

/**
 * Converte string ISO ("2026-05-16" ou ISO completa) para "DD/MM/YYYY".
 */
export function isoToDisplay(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = iso.split("T")[0].split(" ")[0];
  const [y, m, d] = date.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function isoToInputDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.split("T")[0];
}

/**
 * Gera o próximo número sequencial baseado nos pedidos existentes.
 */
export function nextPedidoNumero(existentes: { numero: string }[]): string {
  const numeros = existentes
    .map((p) => {
      const match = p.numero.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => n > 0);
  const next = numeros.length === 0 ? 1 : Math.max(...numeros) + 1;
  return `#${String(next).padStart(6, "0")}`;
}
