export type StatusOrcamento = "Aberto" | "Aprovado" | "Recusado" | "Expirado";

export interface ItemOrcamento {
  id: string;
  produto: string;
  quantidade: number;
  preco_unitario: number;
  desconto_item: number; // %
}

export interface Orcamento {
  id: string;
  numero: string;
  data: string;
  validade: string;
  cliente: string;
  valor_total: number;
  status: StatusOrcamento;
  itens?: ItemOrcamento[];
  observacoes?: string;
  desconto_geral?: number;
}

export const orcamentosData: Orcamento[] = [
  {
    id: "1", numero: "#ORC-0012", data: "14/05/2025", validade: "28/05/2025",
    cliente: "Tech Solutions", valor_total: 2500.0, status: "Aberto",
    desconto_geral: 0, observacoes: "Entrega em até 10 dias úteis.",
    itens: [
      { id: "i1", produto: "Produto C", quantidade: 5, preco_unitario: 320.0, desconto_item: 0 },
      { id: "i2", produto: "Produto A", quantidade: 5, preco_unitario: 180.0, desconto_item: 0 },
    ],
  },
  {
    id: "2", numero: "#ORC-0011", data: "10/05/2025", validade: "24/05/2025",
    cliente: "João Silva Ltda", valor_total: 870.5, status: "Aprovado",
    desconto_geral: 5, observacoes: "",
    itens: [
      { id: "i3", produto: "Produto A", quantidade: 3, preco_unitario: 150.0, desconto_item: 0 },
      { id: "i4", produto: "Produto B", quantidade: 4, preco_unitario: 89.9,  desconto_item: 0 },
    ],
  },
  { id: "3",  numero: "#ORC-0010", data: "05/05/2025", validade: "19/05/2025", cliente: "Maria Souza",       valor_total: 340.0,   status: "Recusado" },
  { id: "4",  numero: "#ORC-0009", data: "01/05/2025", validade: "15/05/2025", cliente: "Distribuidora XYZ", valor_total: 1850.5,  status: "Expirado" },
  { id: "5",  numero: "#ORC-0008", data: "28/04/2025", validade: "12/05/2025", cliente: "Comércio Geral",    valor_total: 430.0,   status: "Aprovado" },
  { id: "6",  numero: "#ORC-0007", data: "22/04/2025", validade: "06/05/2025", cliente: "Pedro Oliveira ME", valor_total: 980.0,   status: "Expirado" },
  { id: "7",  numero: "#ORC-0006", data: "18/04/2025", validade: "02/05/2025", cliente: "Loja Central",      valor_total: 125.9,   status: "Recusado" },
  { id: "8",  numero: "#ORC-0005", data: "10/04/2025", validade: "24/04/2025", cliente: "Tech Solutions",    valor_total: 3200.0,  status: "Aprovado" },
  { id: "9",  numero: "#ORC-0004", data: "05/04/2025", validade: "19/04/2025", cliente: "Importadora Sul",   valor_total: 650.0,   status: "Aberto"   },
  { id: "10", numero: "#ORC-0003", data: "01/04/2025", validade: "15/04/2025", cliente: "Maria Souza",       valor_total: 215.0,   status: "Expirado" },
];

export const clientesMock = [
  "Tech Solutions", "João Silva Ltda", "Maria Souza", "Distribuidora XYZ",
  "Comércio Geral", "Pedro Oliveira ME", "Loja Central", "Importadora Sul",
];

export const produtosMock = [
  { nome: "Produto A", preco: 150.00 },
  { nome: "Produto B", preco: 89.90  },
  { nome: "Produto C", preco: 320.00 },
  { nome: "Produto D", preco: 45.50  },
  { nome: "Produto E", preco: 210.00 },
];