/**
 * Shape padrão de respostas paginadas da crescix-api.
 *
 * Mantido em sincronia com o helper `buildPaginatedResult` do backend
 * (crescix-api/src/lib/http.ts).
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Parâmetros base de qualquer endpoint de listagem.
 * Cada entidade pode estender com filtros específicos.
 */
export interface PaginationQuery {
  limit?: number;
  offset?: number;
  search?: string;
}
