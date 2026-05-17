import { api } from "./api/axios-config";
import type { PaginatedResult } from "./api/paginated";
import type { TipoFornecedor } from "./api/enums";

export interface Fornecedor {
  id: string;
  userId: string;
  razaoSocial: string;
  cnpj: string;
  endereco: string;
  type: TipoFornecedor;
  bairro: string | null;
  numero: string | null;
  ramoAtividade: string | null;
  nomeVendedor: string | null;
  whatsappVendedor: string | null;
  emailVendedor: string | null;
  siteCatalogo: string | null;
  chavePix: string | null;
  banco: string | null;
  agencia: string | null;
  conta: string | null;
  condicaoPagamento: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FornecedorCreate {
  razaoSocial: string;
  cnpj: string;
  endereco: string;
  type: TipoFornecedor;
  bairro?: string;
  numero?: string;
  ramoAtividade?: string;
  nomeVendedor?: string;
  whatsappVendedor?: string;
  emailVendedor?: string;
  siteCatalogo?: string;
  chavePix?: string;
  banco?: string;
  agencia?: string;
  conta?: string;
  condicaoPagamento?: string;
}

export type FornecedorUpdate = Partial<FornecedorCreate>;

export interface FornecedorQuery {
  limit?: number;
  offset?: number;
  search?: string;
  type?: TipoFornecedor;
}

export async function listFornecedores(
  query?: FornecedorQuery
): Promise<PaginatedResult<Fornecedor>> {
  const { data } = await api.get<PaginatedResult<Fornecedor>>("/fornecedores", {
    params: query,
  });
  return data;
}

export async function getFornecedor(id: string): Promise<Fornecedor> {
  const { data } = await api.get<Fornecedor>(`/fornecedores/${id}`);
  return data;
}

export async function createFornecedor(
  input: FornecedorCreate
): Promise<Fornecedor> {
  const { data } = await api.post<Fornecedor>("/fornecedores", input);
  return data;
}

export async function updateFornecedor(
  id: string,
  input: FornecedorUpdate
): Promise<Fornecedor> {
  const { data } = await api.patch<Fornecedor>(`/fornecedores/${id}`, input);
  return data;
}

export async function deleteFornecedor(id: string): Promise<void> {
  await api.delete(`/fornecedores/${id}`);
}
