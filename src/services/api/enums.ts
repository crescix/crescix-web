/**
 * Enums espelhando o schema Prisma do crescix-api.
 *
 * Importante: os valores são em maiúsculo (formato Prisma).
 * Em outras camadas do frontend (mocks, displays) pode haver valores
 * "amigáveis" como "Aberto" — essas conversões ficam na camada de tela,
 * não aqui.
 */

export type TipoFornecedor = "COMERCIO" | "INDUSTRIA" | "SERVICO";

export type StatusCliente = "ATIVO" | "INATIVO";

export type StatusOrcamento = "ABERTO" | "APROVADO" | "RECUSADO" | "EXPIRADO";

export type StatusPedido =
  | "FATURADO"
  | "PENDENTE"
  | "ORCAMENTO"
  | "CANCELADO";

export type CondicaoPagamento =
  | "A_VISTA"
  | "CARTAO_2X"
  | "CARTAO_3X"
  | "CARTAO_5X"
  | "BOLETO"
  | "PIX"
  | "TRANSFERENCIA"
  | "OUTROS";

export type CategoriaPagar =
  | "FORNECEDOR"
  | "ALUGUEL"
  | "ENERGIA"
  | "AGUA"
  | "INTERNET_TELEFONIA"
  | "SALARIOS"
  | "IMPOSTOS"
  | "MARKETING"
  | "MANUTENCAO"
  | "OUTROS";

export type CategoriaReceber =
  | "VENDA"
  | "SERVICO"
  | "COMISSAO"
  | "REEMBOLSO"
  | "OUTROS";

export type StatusConta =
  | "PENDENTE"
  | "PAGO"
  | "RECEBIDO"
  | "ATRASADO"
  | "CANCELADO";

export type FormaPagamento =
  | "DINHEIRO"
  | "PIX"
  | "CARTAO_CREDITO"
  | "CARTAO_DEBITO"
  | "BOLETO"
  | "TRANSFERENCIA"
  | "OUTROS";

export type TipoMovimento = "ENTRADA" | "SAIDA";

export type MotivoMovimento =
  | "COMPRA"
  | "VENDA"
  | "CONSUMO_INTERNO"
  | "DEVOLUCAO"
  | "PERDA_AVARIA"
  | "AJUSTE_MANUAL"
  | "OUTROS";
