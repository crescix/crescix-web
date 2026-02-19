export interface Cliente {
  id: string;
  nome: string;
  saldo: number;
}

export interface Vendedor {
  id: string;
  nome: string;
}

export interface Produto {
  id: string;
  nome: string;
  sku: string;
  preco: number;
}

export interface ItemVenda {
  id: string;
  produto: Produto;
  quantidade: number;
  preco_unitario: number;
  desconto_percentual: number;
  subtotal: number;
}

export interface CondPagamento {
  id: string;
  descricao: string;
}

export interface VendaFormData {
  cliente_id: string;
  vendedor_id: string;
  data_emissao: string;
  itens: ItemVenda[];
  subtotal: number;
  desconto_total: number;
  frete: number;
  total: number;
  condicao_pagamento_id: string;
}

export const clientesData: Cliente[] = [
  { id: "1", nome: "João Silva", saldo: 500.0 },
  { id: "2", nome: "Maria Souza", saldo: 1200.5 },
  { id: "3", nome: "Tech Solutions", saldo: 5000.0 },
  { id: "4", nome: "Pedro Oliveira", saldo: 300.0 },
];

export const vendedoresData: Vendedor[] = [
  { id: "1", nome: "Ana Souza" },
  { id: "2", nome: "Carlos Silva" },
  { id: "3", nome: "Fernanda Costa" },
];

export const produtosData: Produto[] = [
  { id: "1", nome: "Tênis Esportivo", sku: "TEN-001", preco: 200.0 },
  { id: "2", nome: "Camiseta Básica", sku: "CAM-001", preco: 50.0 },
  { id: "3", nome: "Calça Jeans", sku: "CAL-001", preco: 140.0 },
  { id: "4", nome: "Vestido", sku: "VES-001", preco: 110.0 },
  { id: "5", nome: "Jaqueta", sku: "JAC-001", preco: 320.0 },
];

export const condicoesPagamentoData: CondPagamento[] = [
  { id: "1", descricao: "À Vista" },
  { id: "2", descricao: "2x Cartão" },
  { id: "3", descricao: "3x Cartão" },
  { id: "4", descricao: "5x Cartão" },
];

export const itensVendaInicial: ItemVenda[] = [
  {
    id: "1",
    produto: produtosData[0],
    quantidade: 1,
    preco_unitario: 200.0,
    desconto_percentual: 0,
    subtotal: 200.0,
  },
  {
    id: "2",
    produto: produtosData[1],
    quantidade: 2,
    preco_unitario: 50.0,
    desconto_percentual: 10,
    subtotal: 90.0,
  },
  {
    id: "3",
    produto: produtosData[0],
    quantidade: 1,
    preco_unitario: 200.0,
    desconto_percentual: 10,
    subtotal: 180.0,
  },
];
