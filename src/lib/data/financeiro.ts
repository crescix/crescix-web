export type StatusContaPagar = "Pendente" | "Pago" | "Atrasado" | "Cancelado";
export type StatusContaReceber = "Pendente" | "Recebido" | "Atrasado" | "Cancelado";

export type CategoriaPagar =
  | "Fornecedor"
  | "Aluguel"
  | "Energia"
  | "Água"
  | "Internet/Telefonia"
  | "Salários"
  | "Impostos"
  | "Marketing"
  | "Manutenção"
  | "Outros";

export type CategoriaReceber =
  | "Venda"
  | "Serviço"
  | "Comissão"
  | "Reembolso"
  | "Outros";

export type FormaPagamento =
  | "Dinheiro"
  | "Pix"
  | "Cartão de Crédito"
  | "Cartão de Débito"
  | "Boleto"
  | "Transferência"
  | "Outros";

export interface ContaPagar {
  id: string;
  descricao: string;
  fornecedor?: string;
  categoria: CategoriaPagar;
  valor: number;
  vencimento: string;
  data_pagamento?: string;
  status: StatusContaPagar;
  forma_pagamento?: FormaPagamento;
  observacoes?: string;
}

export interface ContaReceber {
  id: string;
  descricao: string;
  cliente?: string;
  categoria: CategoriaReceber;
  valor: number;
  vencimento: string;
  data_recebimento?: string;
  status: StatusContaReceber;
  forma_pagamento?: FormaPagamento;
  observacoes?: string;
}

export const CATEGORIAS_PAGAR: CategoriaPagar[] = [
  "Fornecedor", "Aluguel", "Energia", "Água", "Internet/Telefonia",
  "Salários", "Impostos", "Marketing", "Manutenção", "Outros",
];

export const CATEGORIAS_RECEBER: CategoriaReceber[] = [
  "Venda", "Serviço", "Comissão", "Reembolso", "Outros",
];

export const FORMAS_PAGAMENTO: FormaPagamento[] = [
  "Dinheiro", "Pix", "Cartão de Crédito", "Cartão de Débito",
  "Boleto", "Transferência", "Outros",
];

export const fornecedoresMock = [
  "Distribuidora Alfa", "Tech Supplies", "Atacado Beta",
  "Fornecedora Nordeste", "Importadora Sul",
];

const STORAGE_KEY_PAGAR = "crescix:contas_pagar";
const STORAGE_KEY_RECEBER = "crescix:contas_receber";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function isOverdue(vencimento: string): boolean {
  return vencimento < todayISO();
}

export function recalcStatusPagar(conta: ContaPagar): ContaPagar {
  if (conta.status === "Pendente" && isOverdue(conta.vencimento)) {
    return { ...conta, status: "Atrasado" };
  }
  return conta;
}

export function recalcStatusReceber(conta: ContaReceber): ContaReceber {
  if (conta.status === "Pendente" && isOverdue(conta.vencimento)) {
    return { ...conta, status: "Atrasado" };
  }
  return conta;
}

const contasPagarMock: ContaPagar[] = [
  {
    id: "cp-1", descricao: "Aluguel da loja - Maio",
    categoria: "Aluguel", valor: 2800, vencimento: "2026-05-10",
    status: "Pago", data_pagamento: "2026-05-09", forma_pagamento: "Pix",
  },
  {
    id: "cp-2", descricao: "Energia elétrica - CEMIG",
    categoria: "Energia", valor: 480.75, vencimento: "2026-05-20",
    status: "Pendente", forma_pagamento: "Boleto",
  },
  {
    id: "cp-3", descricao: "Compra de mercadorias",
    fornecedor: "Distribuidora Alfa", categoria: "Fornecedor",
    valor: 3200, vencimento: "2026-05-25", status: "Pendente",
  },
  {
    id: "cp-4", descricao: "Plano de internet",
    categoria: "Internet/Telefonia", valor: 199.9, vencimento: "2026-05-08",
    status: "Pendente",
  },
  {
    id: "cp-5", descricao: "Anúncios Meta Ads",
    categoria: "Marketing", valor: 750, vencimento: "2026-04-28",
    status: "Pago", data_pagamento: "2026-04-28", forma_pagamento: "Cartão de Crédito",
  },
  {
    id: "cp-6", descricao: "Manutenção do ar-condicionado",
    categoria: "Manutenção", valor: 350, vencimento: "2026-06-02",
    status: "Pendente",
  },
];

export function getContasPagar(): ContaPagar[] {
  if (typeof window === "undefined") return contasPagarMock;
  const raw = localStorage.getItem(STORAGE_KEY_PAGAR);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY_PAGAR, JSON.stringify(contasPagarMock));
    return contasPagarMock.map(recalcStatusPagar);
  }
  try {
    const parsed = JSON.parse(raw) as ContaPagar[];
    return parsed.map(recalcStatusPagar);
  } catch {
    return contasPagarMock.map(recalcStatusPagar);
  }
}

export function setContasPagar(contas: ContaPagar[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_PAGAR, JSON.stringify(contas));
}

const contasReceberMock: ContaReceber[] = [
  {
    id: "cr-1", descricao: "Venda Pedido #1254",
    cliente: "Tech Solutions", categoria: "Venda",
    valor: 2500, vencimento: "2026-05-25", status: "Pendente",
  },
  {
    id: "cr-2", descricao: "Serviço de instalação",
    cliente: "João Silva Ltda", categoria: "Serviço",
    valor: 480, vencimento: "2026-05-12", status: "Recebido",
    data_recebimento: "2026-05-12", forma_pagamento: "Pix",
  },
  {
    id: "cr-3", descricao: "Venda Pedido #1255",
    cliente: "Maria Souza", categoria: "Venda",
    valor: 350, vencimento: "2026-05-20", status: "Pendente",
  },
  {
    id: "cr-4", descricao: "Comissão de parceria",
    categoria: "Comissão", valor: 1200, vencimento: "2026-04-30",
    status: "Pendente",
  },
  {
    id: "cr-5", descricao: "Venda Pedido #1253",
    cliente: "Distribuidora XYZ", categoria: "Venda",
    valor: 1850.5, vencimento: "2026-05-08", status: "Recebido",
    data_recebimento: "2026-05-08", forma_pagamento: "Transferência",
  },
];

export function getContasReceber(): ContaReceber[] {
  if (typeof window === "undefined") return contasReceberMock;
  const raw = localStorage.getItem(STORAGE_KEY_RECEBER);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY_RECEBER, JSON.stringify(contasReceberMock));
    return contasReceberMock.map(recalcStatusReceber);
  }
  try {
    return (JSON.parse(raw) as ContaReceber[]).map(recalcStatusReceber);
  } catch {
    return contasReceberMock.map(recalcStatusReceber);
  }
}

export function setContasReceber(contas: ContaReceber[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_RECEBER, JSON.stringify(contas));
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatDateBR(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// ============================================================================
// Fluxo de Caixa — agregação de transações
// ============================================================================

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
  origem: "Pagar" | "Receber";
}

export function getTransacoesFluxo(): TransacaoFluxo[] {
  const pagar = getContasPagar();
  const receber = getContasReceber();
  const out: TransacaoFluxo[] = [];

  for (const p of pagar) {
    if (p.status === "Cancelado") continue;
    const realizada = p.status === "Pago" && !!p.data_pagamento;
    out.push({
      id: `pgr-${p.id}`,
      data: realizada ? p.data_pagamento! : p.vencimento,
      descricao: p.descricao,
      categoria: p.categoria,
      contraparte: p.fornecedor,
      valor: p.valor,
      tipo: "saida",
      natureza: realizada ? "Realizada" : "Prevista",
      origem: "Pagar",
    });
  }

  for (const r of receber) {
    if (r.status === "Cancelado") continue;
    const realizada = r.status === "Recebido" && !!r.data_recebimento;
    out.push({
      id: `rcb-${r.id}`,
      data: realizada ? r.data_recebimento! : r.vencimento,
      descricao: r.descricao,
      categoria: r.categoria,
      contraparte: r.cliente,
      valor: r.valor,
      tipo: "entrada",
      natureza: realizada ? "Realizada" : "Prevista",
      origem: "Receber",
    });
  }

  out.sort((a, b) => b.data.localeCompare(a.data));
  return out;
}

export interface ResumoFluxo {
  entradas: number;
  saidas: number;
  saldo: number;
  entradasPrevistas: number;
  saidasPrevistas: number;
  saldoProjetado: number;
}

export function calcResumoFluxo(transacoes: TransacaoFluxo[]): ResumoFluxo {
  const resumo: ResumoFluxo = {
    entradas: 0, saidas: 0, saldo: 0,
    entradasPrevistas: 0, saidasPrevistas: 0, saldoProjetado: 0,
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
    (resumo.entradas + resumo.entradasPrevistas) -
    (resumo.saidas + resumo.saidasPrevistas);
  return resumo;
}

export interface PontoGrafico {
  data: string;
  entradas: number;
  saidas: number;
}

export function agruparPorDia(transacoes: TransacaoFluxo[]): PontoGrafico[] {
  const mapa = new Map<string, PontoGrafico>();
  for (const t of transacoes) {
    if (t.natureza !== "Realizada") continue;
    const ponto = mapa.get(t.data) ?? { data: t.data, entradas: 0, saidas: 0 };
    if (t.tipo === "entrada") ponto.entradas += t.valor;
    else ponto.saidas += t.valor;
    mapa.set(t.data, ponto);
  }
  return Array.from(mapa.values()).sort((a, b) => a.data.localeCompare(b.data));
}
