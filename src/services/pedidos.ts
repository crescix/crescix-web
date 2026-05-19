import { api } from "./api/axios-config";
import type { PaginatedResult } from "./api/paginated";
import type { StatusPedido, CondicaoPagamento } from "./api/enums";

export interface ItemPedido {
  id: string;
  pedidoId: string;
  produtoId: string | null;
  produtoNome: string;
  quantidade: number;
  precoUnitario: string;
  descontoPercentual: string;
  subtotal: string;
  createdAt: string;
}

export interface Pedido {
  id: string;
  userId: string;
  numero: string;
  data: string;
  clienteId: string | null;
  clienteNome: string;
  vendedorNome: string | null;
  valorTotal: string;
  frete: string;
  condicaoPagamento: CondicaoPagamento | null;
  observacoes: string | null;
  status: StatusPedido;
  orcamentoOrigemId: string | null;
  createdAt: string;
  updatedAt: string;
  itens: ItemPedido[];
}

export interface ItemPedidoInput {
  produtoId?: string;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  descontoPercentual?: number;
}

export interface PedidoCreate {
  numero: string;
  data: string;
  clienteId?: string;
  clienteNome: string;
  vendedorNome?: string;
  itens: ItemPedidoInput[];
  frete?: number;
  condicaoPagamento?: CondicaoPagamento;
  observacoes?: string;
  status?: StatusPedido;
  orcamentoOrigemId?: string;
}

export interface PedidoUpdate {
  numero?: string;
  data?: string;
  clienteId?: string | null;
  clienteNome?: string;
  vendedorNome?: string | null;
  itens?: ItemPedidoInput[];
  frete?: number;
  condicaoPagamento?: CondicaoPagamento | null;
  observacoes?: string | null;
  status?: StatusPedido;
}

export interface PedidoQuery {
  limit?: number;
  offset?: number;
  search?: string;
  status?: StatusPedido;
  clienteId?: string;
}

export async function listPedidos(
  query?: PedidoQuery
): Promise<PaginatedResult<Pedido>> {
  const { data } = await api.get<PaginatedResult<Pedido>>("/pedidos", {
    params: query,
  });
  return data;
}

export async function getPedido(id: string): Promise<Pedido> {
  const { data } = await api.get<Pedido>(`/pedidos/${id}`);
  return data;
}

export async function createPedido(input: PedidoCreate): Promise<Pedido> {
  const { data } = await api.post<Pedido>("/pedidos", input);
  return data;
}

export async function updatePedido(
  id: string,
  input: PedidoUpdate
): Promise<Pedido> {
  const { data } = await api.patch<Pedido>(`/pedidos/${id}`, input);
  return data;
}

export async function deletePedido(id: string): Promise<void> {
  await api.delete(`/pedidos/${id}`);
}
