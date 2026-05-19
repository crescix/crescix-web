import { api } from "./api/axios-config";
import type { PaginatedResult } from "./api/paginated";
import type { StatusCliente } from "./api/enums";

export interface Cliente {
  id: string;
  userId: string;
  nome: string;
  cpf: string | null;
  telefone: string | null;
  email: string | null;
  saldo: string; // Decimal serializado como string pelo Prisma
  status: StatusCliente;
  createdAt: string;
  updatedAt: string;
}

export interface ClienteCreate {
  nome: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  saldo?: number;
  status?: StatusCliente;
}

export type ClienteUpdate = Partial<ClienteCreate>;

export interface ClienteQuery {
  limit?: number;
  offset?: number;
  search?: string;
  status?: StatusCliente;
}

export async function listClientes(
  query?: ClienteQuery
): Promise<PaginatedResult<Cliente>> {
  const { data } = await api.get<PaginatedResult<Cliente>>("/clientes", {
    params: query,
  });
  return data;
}

export async function getCliente(id: string): Promise<Cliente> {
  const { data } = await api.get<Cliente>(`/clientes/${id}`);
  return data;
}

export async function createCliente(input: ClienteCreate): Promise<Cliente> {
  const { data } = await api.post<Cliente>("/clientes", input);
  return data;
}

export async function updateCliente(
  id: string,
  input: ClienteUpdate
): Promise<Cliente> {
  const { data } = await api.patch<Cliente>(`/clientes/${id}`, input);
  return data;
}

export async function deleteCliente(id: string): Promise<void> {
  await api.delete(`/clientes/${id}`);
}
