import { api } from "./api/axios-config";
import type { PaginatedResult } from "./api/paginated";

export interface Produto {
  id: string;
  userId: string;
  nome: string;
  sku: string | null;
  descricao: string | null;
  preco: string; // Decimal serializado
  estoqueMinimo: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProdutoCreate {
  nome: string;
  sku?: string;
  descricao?: string;
  preco: number;
  estoqueMinimo?: number;
}

export type ProdutoUpdate = Partial<ProdutoCreate>;

export interface ProdutoQuery {
  limit?: number;
  offset?: number;
  search?: string;
}

export async function listProdutos(
  query?: ProdutoQuery
): Promise<PaginatedResult<Produto>> {
  const { data } = await api.get<PaginatedResult<Produto>>("/produtos", {
    params: query,
  });
  return data;
}

export async function getProduto(id: string): Promise<Produto> {
  const { data } = await api.get<Produto>(`/produtos/${id}`);
  return data;
}

export async function createProduto(input: ProdutoCreate): Promise<Produto> {
  const { data } = await api.post<Produto>("/produtos", input);
  return data;
}

export async function updateProduto(
  id: string,
  input: ProdutoUpdate
): Promise<Produto> {
  const { data } = await api.patch<Produto>(`/produtos/${id}`, input);
  return data;
}

export async function deleteProduto(id: string): Promise<void> {
  await api.delete(`/produtos/${id}`);
}
