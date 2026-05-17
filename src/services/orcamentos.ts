import { api } from "./api/axios-config";
import type { PaginatedResult } from "./api/paginated";
import type { StatusOrcamento } from "./api/enums";

export interface ItemOrcamento {
  id: string;
  orcamentoId: string;
  produtoId: string | null;
  produtoNome: string;
  quantidade: number;
  precoUnitario: string; // Decimal
  descontoItem: string; // Decimal
  createdAt: string;
}

export interface Orcamento {
  id: string;
  userId: string;
  numero: string;
  data: string;
  validade: string;
  clienteId: string | null;
  clienteNome: string;
  valorTotal: string; // Decimal
  descontoGeral: string; // Decimal
  observacoes: string | null;
  status: StatusOrcamento;
  createdAt: string;
  updatedAt: string;
  itens: ItemOrcamento[];
}

export interface ItemOrcamentoInput {
  produtoId?: string;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  descontoItem?: number;
}

export interface OrcamentoCreate {
  numero: string;
  data: string; // YYYY-MM-DD
  validade: string; // YYYY-MM-DD
  clienteId?: string;
  clienteNome: string;
  itens: ItemOrcamentoInput[];
  descontoGeral?: number;
  observacoes?: string;
  status?: StatusOrcamento;
}

export interface OrcamentoUpdate {
  numero?: string;
  data?: string;
  validade?: string;
  clienteId?: string | null;
  clienteNome?: string;
  itens?: ItemOrcamentoInput[];
  descontoGeral?: number;
  observacoes?: string | null;
  status?: StatusOrcamento;
}

export interface OrcamentoQuery {
  limit?: number;
  offset?: number;
  search?: string;
  status?: StatusOrcamento;
  clienteId?: string;
}

export async function listOrcamentos(
  query?: OrcamentoQuery
): Promise<PaginatedResult<Orcamento>> {
  const { data } = await api.get<PaginatedResult<Orcamento>>("/orcamentos", {
    params: query,
  });
  return data;
}

export async function getOrcamento(id: string): Promise<Orcamento> {
  const { data } = await api.get<Orcamento>(`/orcamentos/${id}`);
  return data;
}

export async function createOrcamento(
  input: OrcamentoCreate
): Promise<Orcamento> {
  const { data } = await api.post<Orcamento>("/orcamentos", input);
  return data;
}

export async function updateOrcamento(
  id: string,
  input: OrcamentoUpdate
): Promise<Orcamento> {
  const { data } = await api.patch<Orcamento>(`/orcamentos/${id}`, input);
  return data;
}

export async function deleteOrcamento(id: string): Promise<void> {
  await api.delete(`/orcamentos/${id}`);
}
