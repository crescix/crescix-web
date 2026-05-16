export type MenuSubItem = {
  label: string;
  href: string;
};

export type MenuItem = {
  id: string;
  label: string;
  items: MenuSubItem[];
};

/**
 * Menu unificado — usado tanto na navbar desktop quanto no drawer mobile.
 * Cada subitem leva direto para a página (sem mais 2 níveis Cadastro/Filtro).
 */
export const NAVBAR_MENU: MenuItem[] = [
  {
    id: "negocio",
    label: "Meu Negócio",
    items: [
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    id: "cadastros",
    label: "Cadastros",
    items: [
      { label: "Fornecedores", href: "/fornecedores" },
      { label: "Clientes", href: "/clientes" },
      { label: "Produtos", href: "/produtos" },
    ],
  },
  {
    id: "vendas",
    label: "Vendas",
    items: [
      { label: "Pedidos", href: "/vendas/pedidos" },
      { label: "Orçamentos", href: "/vendas/orcamentos" },
    ],
  },
  {
    id: "estoque",
    label: "Estoque",
    items: [
      { label: "Entradas", href: "/estoque/entradas" },
      { label: "Saídas", href: "/estoque/saidas" },
      { label: "Inventário", href: "/estoque/inventario" },
    ],
  },
  {
    id: "financeiro",
    label: "Financeiro",
    items: [
      { label: "Contas a Pagar", href: "/financeiro/pagar" },
      { label: "Contas a Receber", href: "/financeiro/receber" },
      { label: "Fluxo de Caixa", href: "/financeiro/fluxo-de-caixa" },
    ],
  },
];
