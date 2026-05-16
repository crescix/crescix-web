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

export function getContasReceber(): ContaReceber[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY_RECEBER);
  if (!raw) return [];
  try {
    return (JSON.parse(raw) as ContaReceber[]).map(recalcStatusReceber);
  } catch {
    return [];
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
