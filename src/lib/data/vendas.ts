export type StatusPedido = "Faturado" | "Pendente" | "Orçamento" | "Cancelado";

export interface Pedido {
  id: string;
  numero: string;
  data: string;
  cliente: string;
  valor_total: number;
  status: StatusPedido;
}

export const pedidosData: Pedido[] = [
  {
    id: "1",
    numero: "#001254",
    data: "24/05/2024",
    cliente: "João Silva Ltda",
    valor_total: 470.00,
    status: "Faturado",
  },
  {
    id: "2",
    numero: "#001253",
    data: "23/05/2024",
    cliente: "Maria Souza",
    valor_total: 120.00,
    status: "Pendente",
  },
  {
    id: "3",
    numero: "#001252",
    data: "23/05/2024",
    cliente: "Tech Solutions",
    valor_total: 2500.00,
    status: "Orçamento",
  },
  {
    id: "4",
    numero: "#001251",
    data: "22/05/2024",
    cliente: "Pedro Oliveira",
    valor_total: 50.00,
    status: "Cancelado",
  },
  {
    id: "5",
    numero: "#001250",
    data: "20/05/2024",
    cliente: "Distribuidora XYZ",
    valor_total: 1850.50,
    status: "Faturado",
  },
  {
    id: "6",
    numero: "#001249",
    data: "19/05/2024",
    cliente: "Comércio Geral",
    valor_total: 340.00,
    status: "Pendente",
  },
];
