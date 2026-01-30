export interface MetricCardData {
    title: string;
    value: string;
    subtext: string;
    trend?: "up" | "down" | "neutral";
    icon: "coins" | "receipt" | "box" | "cart";
  }
  
  export interface SalesData {
    day: string;
    sales: number;
  }
  
  export interface ProductData {
    product: string;
    visitors: number;
    fill: string;
  }
  
  export const kpiData: MetricCardData[] = [
    {
      title: "Faturamento do Dia",
      value: "R$ 15.200,00",
      subtext: "+5% que ontem",
      trend: "up",
      icon: "coins",
    },
    {
      title: "Contas a Pagar",
      value: "R$ 3.500,00",
      subtext: "Vencendo Hoje",
      trend: "neutral",
      icon: "receipt",
    },
    {
      title: "Alerta de Estoque",
      value: "8 Itens",
      subtext: "Abaixo do mínimo",
      trend: "down",
      icon: "box",
    },
    {
      title: "Vendas Totais",
      value: "250",
      subtext: "Mês atual",
      trend: "up",
      icon: "cart",
    },
  ];
  
  export const salesChartData: SalesData[] = [
    { day: "01", sales: 850 },
    { day: "02", sales: 940 },
    { day: "03", sales: 1000 },
    { day: "04", sales: 980 },
    { day: "05", sales: 300 },
    { day: "06", sales: 280 },
    { day: "07", sales: 750 },
    { day: "08", sales: 780 },
    { day: "09", sales: 600 },
    { day: "10", sales: 290 },
    { day: "11", sales: 320 },
    { day: "12", sales: 820 },
    { day: "13", sales: 650 },
    { day: "14", sales: 700 },
    { day: "15", sales: 50 },
  ];
  
  export const productsChartData: ProductData[] = [
    { product: "Eletrônicos", visitors: 32, fill: "#fff" },
    { product: "Roupas", visitors: 30, fill: "var(--secondary)" },
    { product: "Casa", visitors: 18, fill: "var(--secondary)" },
    { product: "Esportes", visitors: 10, fill: "#ffd849" },
    { product: "Outros", visitors: 10, fill: "#fff" },
  ];