import { api } from "./api/axios-config";
import type { PaginatedResult } from "./api/paginated";
import type {
  CategoriaReceber,
  StatusConta,
  FormaPagamento,
} from "./api/enums";

export interface ContaReceber {
  id: string;
  userId: string;
  descricao: string;
  clienteId: string | null;
  categoria: CategoriaReceber;
  valor: string;
  vencimento: string;
  dataRecebimento: string | null;
  status: StatusConta;
  formaPagamento: FormaPagamento | null;
  observacoes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContaReceberCreate {
  descricao: string;
  clienteId?: string;
  categoria: CategoriaReceber;
  valor: number;
  vencimento: string;
  dataRecebimento?: string;
  status?: StatusConta;
  formaPagamento?: FormaPagamento;
  observacoes?: string;
}

export interface ContaReceberUpdate {
  descricao?: string;
  clienteId?: string | null;
  categoria?: CategoriaReceber;
  valor?: number;
  vencimento?: string;
  dataRecebimento?: string | null;
  status?: StatusConta;
  formaPagamento?: FormaPagamento | null;
  observacoes?: string | null;
}

export interface ContaReceberQuery {
  limit?: number;
  offset?: number;
  search?: string;
  status?: StatusConta;
  categoria?: CategoriaReceber;
  vencimentoFrom?: string;
  vencimentoTo?: string;
}

export async function listContasReceber(
  query?: ContaReceberQuery
): Promise<PaginatedResult<ContaReceber>> {
  const { data } = await api.get<PaginatedResult<ContaReceber>>(
    "/contas-receber",
    { params: query }
  );
  return data;
}

export async function getContaReceber(id: string): Promise<ContaReceber> {
  const { data } = await api.get<ContaReceber>(`/contas-receber/${id}`);
  return data;
}

export async function createContaReceber(
  input: ContaReceberCreate
): Promise<ContaReceber> {
  const { data } = await api.post<ContaReceber>("/contas-receber", input);
  return data;
}

export async function updateContaReceber(
  id: string,
  input: ContaReceberUpdate
): Promise<ContaReceber> {
  const { data } = await api.patch<ContaReceber>(
    `/contas-receber/${id}`,
    input
  );
  return data;
}

export async function deleteContaReceber(id: string): Promise<void> {
  await api.delete(`/contas-receber/${id}`);
}
