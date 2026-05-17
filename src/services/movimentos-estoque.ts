import { api } from "./api/axios-config";
import type { PaginatedResult } from "./api/paginated";
import type { TipoMovimento, MotivoMovimento } from "./api/enums";

/**
 * Movimentos de estoque são imutáveis no backend — não há endpoint de UPDATE.
 * Para corrigir, lance um movimento compensatório (devolução/ajuste).
 */

export interface MovimentoEstoque {
  id: string;
  userId: string;
  produtoId: string;
  fornecedorId: string | null;
  tipo: TipoMovimento;
  motivo: MotivoMovimento;
  quantidade: number;
  custoUnitario: string | null;
  valorVenda: string | null;
  observacoes: string | null;
  createdAt: string;
  produto?: {
    id: string;
    nome: string;
    sku: string | null;
  };
}

export interface MovimentoEstoqueCreate {
  produtoId: string;
  fornecedorId?: string;
  tipo: TipoMovimento;
  motivo: MotivoMovimento;
  quantidade: number;
  custoUnitario?: number;
  valorVenda?: number;
  observacoes?: string;
}

export interface MovimentoEstoqueQuery {
  limit?: number;
  offset?: number;
  produtoId?: string;
  tipo?: TipoMovimento;
  motivo?: MotivoMovimento;
  dataFrom?: string;
  dataTo?: string;
}

export async function listMovimentos(
  query?: MovimentoEstoqueQuery
): Promise<PaginatedResult<MovimentoEstoque>> {
  const { data } = await api.get<PaginatedResult<MovimentoEstoque>>(
    "/movimentos-estoque",
    { params: query }
  );
  return data;
}

export async function getMovimento(id: string): Promise<MovimentoEstoque> {
  const { data } = await api.get<MovimentoEstoque>(
    `/movimentos-estoque/${id}`
  );
  return data;
}

export async function createMovimento(
  input: MovimentoEstoqueCreate
): Promise<MovimentoEstoque> {
  const { data } = await api.post<MovimentoEstoque>(
    "/movimentos-estoque",
    input
  );
  return data;
}

export async function deleteMovimento(id: string): Promise<void> {
  await api.delete(`/movimentos-estoque/${id}`);
}
