/**
 * Re-exports do service + helpers de display do módulo Financeiro
 * (Contas a Pagar, Contas a Receber e Fluxo de Caixa).
 *
 * Os mocks/localStorage foram removidos — os dados vêm da API agora.
 */

export type {
  ContaPagar,
  ContaPagarCreate,
  ContaPagarUpdate,
  ContaPagarQuery,
} from "@/services/contas-pagar";

export type {
  ContaReceber,
  ContaReceberCreate,
  ContaReceberUpdate,
  ContaReceberQuery,
} from "@/services/contas-receber";

import type {
  CategoriaPagar,
  CategoriaReceber,
  StatusConta,
  FormaPagamento,
} from "@/services/api/enums";

export type {
  CategoriaPagar,
  CategoriaReceber,
  StatusConta,
  FormaPagamento,
} from "@/services/api/enums";

import type { ContaPagar } from "@/services/contas-pagar";
import type { ContaReceber } from "@/services/contas-receber";
import type { Pedido } from "@/services/pedidos";
import type { MovimentoEstoque } from "@/services/movimentos-estoque";

// ─── Labels e options ─────────────────────────────────────────────────────────

export const CATEGORIA_PAGAR_LABEL: Record<CategoriaPagar, string> = {
  FORNECEDOR:         "Fornecedor",
  ALUGUEL:            "Aluguel",
  ENERGIA:            "Energia",
  AGUA:               "Água",
  INTERNET_TELEFONIA: "Internet/Telefonia",
  SALARIOS:           "Salários",
  IMPOSTOS:           "Impostos",
  MARKETING:          "Marketing",
  MANUTENCAO:         "Manutenção",
  OUTROS:             "Outros",
};

export const CATEGORIA_PAGAR_OPTIONS: CategoriaPagar[] = [
  "FORNECEDOR",
  "ALUGUEL",
  "ENERGIA",
  "AGUA",
  "INTERNET_TELEFONIA",
  "SALARIOS",
  "IMPOSTOS",
  "MARKETING",
  "MANUTENCAO",
  "OUTROS",
];

export const CATEGORIA_RECEBER_LABEL: Record<CategoriaReceber, string> = {
  VENDA:     "Venda",
  SERVICO:   "Serviço",
  COMISSAO:  "Comissão",
  REEMBOLSO: "Reembolso",
  OUTROS:    "Outros",
};

export const CATEGORIA_RECEBER_OPTIONS: CategoriaReceber[] = [
  "VENDA",
  "SERVICO",
  "COMISSAO",
  "REEMBOLSO",
  "OUTROS",
];

export const STATUS_CONTA_LABEL: Record<StatusConta, string> = {
  PENDENTE:  "Pendente",
  PAGO:      "Pago",
  RECEBIDO:  "Recebido",
  ATRASADO:  "Atrasado",
  CANCELADO: "Cancelado",
};

export const STATUS_CONTA_STYLES: Record<StatusConta, string> = {
  PENDENTE:  "bg-amber-500/15 text-amber-400 border-amber-500/25",
  PAGO:      "bg-green-500/15 text-green-400 border-green-500/25",
  RECEBIDO:  "bg-green-500/15 text-green-400 border-green-500/25",
  ATRASADO:  "bg-red-500/15 text-red-400 border-red-500/25",
  CANCELADO: "bg-white/10 text-white/40 border-white/15",
};

/** Status disponíveis no filtro/form de contas a pagar (exclui RECEBIDO). */
export const STATUS_CONTA_PAGAR_OPTIONS: StatusConta[] = [
  "PENDENTE",
  "PAGO",
  "ATRASADO",
  "CANCELADO",
];

/** Status disponíveis no filtro/form de contas a receber (exclui PAGO). */
export const STATUS_CONTA_RECEBER_OPTIONS: StatusConta[] = [
  "PENDENTE",
  "RECEBIDO",
  "ATRASADO",
  "CANCELADO",
];

export const FORMA_PAGAMENTO_LABEL: Record<FormaPagamento, string> = {
  DINHEIRO:       "Dinheiro",
  PIX:            "Pix",
  CARTAO_CREDITO: "Cartão de Crédito",
  CARTAO_DEBITO:  "Cartão de Débito",
  BOLETO:         "Boleto",
  TRANSFERENCIA:  "Transferência",
  OUTROS:         "Outros",
};

export const FORMA_PAGAMENTO_OPTIONS: FormaPagamento[] = [
  "DINHEIRO",
  "PIX",
  "CARTAO_CREDITO",
  "CARTAO_DEBITO",
  "BOLETO",
  "TRANSFERENCIA",
  "OUTROS",
];

// ─── Helpers de display ──────────────────────────────────────────────────────

export function formatBRL(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? Number(value) : (value ?? 0);
  if (!Number.isFinite(n)) return "R$ 0,00";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Converte ISO ("2026-05-16" ou completo) para "DD/MM/YYYY".
 */
export function formatDateBR(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = iso.split("T")[0].split(" ")[0];
  const [y, m, d] = date.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

/** Alias semântico igual ao usado nos outros módulos. */
export const isoToDisplay = formatDateBR;

export function isoToInputDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.split("T")[0];
}

// ─── Fluxo de Caixa — agregação ─────────────────────────────────────────────

export type TipoTransacao = "entrada" | "saida";
export type NaturezaTransacao = "Realizada" | "Prevista";

export interface TransacaoFluxo {
  id: string;
  data: string;
  descricao: string;
  categoria: string;
  contraparte?: string;
  valor: number;
  tipo: TipoTransacao;
  natureza: NaturezaTransacao;
  origem: "Pagar" | "Receber" | "Venda" | "Compra";
}

export const ORIGEM_LABEL: Record<TransacaoFluxo["origem"], string> = {
  Pagar:   "A Pagar",
  Receber: "A Receber",
  Venda:   "Venda",
  Compra:  "Compra",
};

export interface FluxoSources {
  pagar?: ContaPagar[];
  receber?: ContaReceber[];
  pedidos?: Pedido[];
  movimentos?: MovimentoEstoque[];
}

export interface ResumoFluxo {
  entradas: number;
  saidas: number;
  saldo: number;
  entradasPrevistas: number;
  saidasPrevistas: number;
  saldoProjetado: number;
}

export interface PontoGrafico {
  data: string;
  entradas: number;
  saidas: number;
}

/**
 * Constrói o array de transações de fluxo de caixa a partir das fontes
 * disponíveis: contas a pagar/receber, pedidos faturados e movimentos
 * de estoque (compras). Função pura (sem fetch).
 *
 * Aceita ou (pagar, receber) — assinatura legada — ou um objeto
 * `FluxoSources` com qualquer combinação.
 */
export function buildTransacoesFluxo(
  pagarOrSources: ContaPagar[] | FluxoSources,
  receber?: ContaReceber[]
): TransacaoFluxo[] {
  const sources: FluxoSources = Array.isArray(pagarOrSources)
    ? { pagar: pagarOrSources, receber: receber ?? [] }
    : pagarOrSources;

  const out: TransacaoFluxo[] = [];

  for (const p of sources.pagar ?? []) {
    if (p.status === "CANCELADO") continue;
    const realizada = p.status === "PAGO" && !!p.dataPagamento;
    out.push({
      id: `pgr-${p.id}`,
      data: realizada
        ? p.dataPagamento!.split("T")[0]
        : p.vencimento.split("T")[0],
      descricao: p.descricao,
      categoria: CATEGORIA_PAGAR_LABEL[p.categoria] ?? p.categoria,
      contraparte: undefined,
      valor: Number(p.valor),
      tipo: "saida",
      natureza: realizada ? "Realizada" : "Prevista",
      origem: "Pagar",
    });
  }

  for (const r of sources.receber ?? []) {
    if (r.status === "CANCELADO") continue;
    const realizada = r.status === "RECEBIDO" && !!r.dataRecebimento;
    out.push({
      id: `rcb-${r.id}`,
      data: realizada
        ? r.dataRecebimento!.split("T")[0]
        : r.vencimento.split("T")[0],
      descricao: r.descricao,
      categoria: CATEGORIA_RECEBER_LABEL[r.categoria] ?? r.categoria,
      contraparte: undefined,
      valor: Number(r.valor),
      tipo: "entrada",
      natureza: realizada ? "Realizada" : "Prevista",
      origem: "Receber",
    });
  }

  // Vendas — apenas pedidos PENDENTE entram como entrada Prevista no fluxo.
  // Pedidos FATURADO ja sao representados automaticamente por uma Conta a
  // Receber (criada pelo backend em ensureContaReceberFromPedido), entao
  // incluir aqui causaria double-count. ORCAMENTO/CANCELADO sao ignorados.
  for (const ped of sources.pedidos ?? []) {
    if (ped.status !== "PENDENTE") continue;
    out.push({
      id: `ped-${ped.id}`,
      data: ped.data.split("T")[0],
      descricao: `Venda ${ped.numero}`,
      categoria: "Venda",
      contraparte: ped.clienteNome,
      valor: Number(ped.valorTotal),
      tipo: "entrada",
      natureza: "Prevista",
      origem: "Venda",
    });
  }

  // Compras — movimentos de estoque tipo ENTRADA + motivo COMPRA entram
  // como saída Realizada. Valor = quantidade × custoUnitario.
  for (const m of sources.movimentos ?? []) {
    if (m.tipo !== "ENTRADA" || m.motivo !== "COMPRA") continue;
    const custo = Number(m.custoUnitario ?? 0);
    if (!custo) continue;
    const valor = m.quantidade * custo;
    out.push({
      id: `mov-${m.id}`,
      data: m.createdAt.split("T")[0],
      descricao: `Compra de ${m.produto?.nome ?? "produto"} (${m.quantidade}x)`,
      categoria: "Compra",
      contraparte: undefined,
      valor,
      tipo: "saida",
      natureza: "Realizada",
      origem: "Compra",
    });
  }

  out.sort((a, b) => b.data.localeCompare(a.data));
  return out;
}

export function calcResumoFluxo(transacoes: TransacaoFluxo[]): ResumoFluxo {
  const resumo: ResumoFluxo = {
    entradas: 0,
    saidas: 0,
    saldo: 0,
    entradasPrevistas: 0,
    saidasPrevistas: 0,
    saldoProjetado: 0,
  };
  for (const t of transacoes) {
    if (t.natureza === "Realizada") {
      if (t.tipo === "entrada") resumo.entradas += t.valor;
      else resumo.saidas += t.valor;
    } else {
      if (t.tipo === "entrada") resumo.entradasPrevistas += t.valor;
      else resumo.saidasPrevistas += t.valor;
    }
  }
  resumo.saldo = resumo.entradas - resumo.saidas;
  resumo.saldoProjetado =
    resumo.entradas + resumo.entradasPrevistas
    - (resumo.saidas + resumo.saidasPrevistas);
  return resumo;
}

export function agruparPorDia(transacoes: TransacaoFluxo[]): PontoGrafico[] {
  const mapa = new Map<string, PontoGrafico>();
  for (const t of transacoes) {
    if (t.natureza !== "Realizada") continue;
    const ponto =
      mapa.get(t.data) ?? { data: t.data, entradas: 0, saidas: 0 };
    if (t.tipo === "entrada") ponto.entradas += t.valor;
    else ponto.saidas += t.valor;
    mapa.set(t.data, ponto);
  }
  return Array.from(mapa.values()).sort((a, b) =>
    a.data.localeCompare(b.data)
  );
}
