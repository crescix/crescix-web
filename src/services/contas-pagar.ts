import { api } from "./api/axios-config";
import type { PaginatedResult } from "./api/paginated";
import type {
  CategoriaPagar,
  StatusConta,
  FormaPagamento,
} from "./api/enums";

export interface ContaPagar {
  id: string;
  userId: string;
  descricao: string;
  fornecedorId: string | null;
  categoria: CategoriaPagar;
  valor: string;
  vencimento: string;
  dataPagamento: string | null;
  status: StatusConta;
  formaPagamento: FormaPagamento | null;
  observacoes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContaPagarCreate {
  descricao: string;
  fornecedorId?: string;
  categoria: CategoriaPagar;
  valor: number;
  vencimento: string;
  dataPagamento?: string;
  status?: StatusConta;
  formaPagamento?: FormaPagamento;
  observacoes?: string;
}

export interface ContaPagarUpdate {
  descricao?: string;
  fornecedorId?: string | null;
  categoria?: CategoriaPagar;
  valor?: number;
  vencimento?: string;
  dataPagamento?: string | null;
  status?: StatusConta;
  formaPagamento?: FormaPagamento | null;
  observacoes?: string | null;
}

export interface ContaPagarQuery {
  limit?: number;
  offset?: number;
  search?: string;
  status?: StatusConta;
  categoria?: CategoriaPagar;
  vencimentoFrom?: string;
  vencimentoTo?: string;
}

export async function listContasPagar(
  query?: ContaPagarQuery
): Promise<PaginatedResult<ContaPagar>> {
  const { data } = await api.get<PaginatedResult<ContaPagar>>("/contas-pagar", {
    params: query,
  });
  return data;
}

export async function getContaPagar(id: string): Promise<ContaPagar> {
  const { data } = await api.get<ContaPagar>(`/contas-pagar/${id}`);
  return data;
}

export async function createContaPagar(
  input: ContaPagarCreate
): Promise<ContaPagar> {
  const { data } = await api.post<ContaPagar>("/contas-pagar", input);
  return data;
}

export async function updateContaPagar(
  id: string,
  input: ContaPagarUpdate
): Promise<ContaPagar> {
  const { data } = await api.patch<ContaPagar>(`/contas-pagar/${id}`, input);
  return data;
}

export async function deleteContaPagar(id: string): Promise<void> {
  await api.delete(`/contas-pagar/${id}`);
}
