/**
 * Re-exports do service para manter retrocompatibilidade dos componentes
 * que importam `Fornecedor` deste caminho.
 *
 * O mock `fornecedoresData` foi removido — agora os dados vêm da API via
 * `listFornecedores`. Se precisar de dados para preview/Storybook,
 * defina mocks específicos lá.
 */

export type {
  Fornecedor,
  FornecedorCreate,
  FornecedorUpdate,
  FornecedorQuery,
} from "@/services/fornecedores";

export type { TipoFornecedor as FornecedorType } from "@/services/api/enums";
import type { TipoFornecedor } from "@/services/api/enums";

/**
 * Mapa de display: o backend usa enum em MAIÚSCULO (COMERCIO),
 * a UI mostra com acentuação ("Comércio").
 */
export const FORNECEDOR_TYPE_LABEL: Record<TipoFornecedor, string> = {
  COMERCIO: "Comércio",
  INDUSTRIA: "Indústria",
  SERVICO: "Serviço",
};

export const FORNECEDOR_TYPES: TipoFornecedor[] = [
  "COMERCIO",
  "INDUSTRIA",
  "SERVICO",
];
