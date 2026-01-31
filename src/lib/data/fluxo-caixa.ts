export interface Transaction {
    id: string;
    vencimento: string;
    descricao: string;
    categoria: string;
    valor: number;
    status: "pago" | "aberto" | "atrasado";
    tipo: "receita" | "despesa";
  }
  
  export const transactions: Transaction[] = [
    { id: "1", vencimento: "2024-05-25", descricao: "Venda Pedido #1254", categoria: "Receita de Vendas", valor: 200.00, status: "pago", tipo: "receita" },
    { id: "2", vencimento: "2024-05-25", descricao: "Conta de Energia Cemig", categoria: "Desp. Admin.", valor: -150.00, status: "aberto", tipo: "despesa" },
    { id: "3", vencimento: "2024-05-24", descricao: "Compra Estoque Nike", categoria: "Custo Mercadoria", valor: -800.00, status: "pago", tipo: "despesa" },
    { id: "4", vencimento: "2024-05-23", descricao: "Venda Pedido #1253", categoria: "Receita de Vendas", valor: 200.00, status: "pago", tipo: "receita" },
    { id: "5", vencimento: "2024-05-22", descricao: "Assinatura Software", categoria: "TI", valor: -45.00, status: "pago", tipo: "despesa" },
    { id: "6", vencimento: "2024-05-21", descricao: "Venda Pedido #1252", categoria: "Receita de Vendas", valor: 350.00, status: "pago", tipo: "receita" },
    { id: "7", vencimento: "2024-05-20", descricao: "Manutenção Loja", categoria: "Infra", valor: -120.00, status: "aberto", tipo: "despesa" },
    { id: "8", vencimento: "2024-05-19", descricao: "Venda Pedido #1251", categoria: "Receita de Vendas", valor: 150.00, status: "pago", tipo: "receita" },
  ];