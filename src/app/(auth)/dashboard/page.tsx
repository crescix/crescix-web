"use client"

import {
  Coins,
  ShoppingCart,
  Receipt,
  Package,
  TrendingUp,
  TrendingDown,
  Bell,
  ChevronUp,
} from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

// ── Dados mock ────────────────────────────────────────────────────────────────
const kpiCards = [
  {
    title: "Faturamento do Dia",
    value: "R$ 15.200,00",
    sub: "+5% que ontem",
    trend: "up",
    icon: Coins,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    title: "Vendas Totais",
    value: "250",
    sub: "Mês atual",
    trend: "up",
    icon: ShoppingCart,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Contas a Pagar",
    value: "R$ 3.500,00",
    sub: "Vencendo Hoje",
    trend: "down",
    icon: Receipt,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    title: "Alerta de Estoque Baixo",
    value: "8 Itens",
    sub: "Abaixo do mínimo",
    trend: "down",
    icon: Package,
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
]

const salesData = Array.from({ length: 15 }, (_, i) => ({
  day: i + 1,
  sales: Math.floor(Math.random() * 800) + 200,
}))

const productsData = [
  { name: "Eletrônicos", value: 32, color: "#0d9488" },
  { name: "Roupas",      value: 30, color: "#0f766e" },
  { name: "Casa",        value: 18, color: "#5eead4" },
  { name: "Esportes",    value: 10, color: "#99f6e4" },
  { name: "Outros",      value: 10, color: "#ccfbf1" },
]

const recentOrders = [
  { date: "02/09/2025", client: "Marcos Pereira",  value: "R$ 1.200,00", status: "Entregue" },
  { date: "02/09/2025", client: "Ana Lima",        value: "R$ 850,00",   status: "Pendente" },
  { date: "01/09/2025", client: "Carlos Souza",    value: "R$ 3.400,00", status: "Pendente" },
  { date: "01/09/2025", client: "Fernanda Costa",  value: "R$ 720,00",   status: "Entregue" },
  { date: "31/08/2025", client: "Ricardo Neves",   value: "R$ 2.100,00", status: "Cancelado" },
]

const statusStyle: Record<string, string> = {
  Entregue:  "bg-emerald-100 text-emerald-700",
  Pendente:  "bg-amber-100 text-amber-700",
  Cancelado: "bg-rose-100 text-rose-700",
}

// ── Tooltip customizado do gráfico de área ─────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-lg text-sm">
        <p className="text-gray-400 mb-1">Dia {label}</p>
        <p className="font-semibold text-teal-700">
          R$ {payload[0].value.toLocaleString("pt-BR")}
        </p>
      </div>
    )
  }
  return null
}

// ── Componente principal ───────────────────────────────────────────────────
export default function DashBoard() {
  return (
    <div className="min-h-screen w-full bg-transparent py-8">
      <div className="max-w-7xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm px-4  md:px-8 py-8 space-y-6">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
              Visão Geral
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              Ao vivo
            </span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpiCards.map((card, i) => {
            const Icon = card.icon
            return (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow"
              >
                <div className={`${card.bg} rounded-xl p-3 flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 font-medium truncate">{card.title}</p>
                  <p className="text-lg font-bold text-gray-800 mt-0.5 leading-tight">
                    {card.value}
                  </p>
                  <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${
                    card.trend === "up" ? "text-emerald-600" : "text-rose-500"
                  }`}>
                    {card.trend === "up"
                      ? <TrendingUp className="w-3 h-3" />
                      : <TrendingDown className="w-3 h-3" />
                    }
                    {card.sub}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Gráfico de Área */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-semibold text-gray-700">
                  Vendas nos últimos 15 dias
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Acompanhamento diário</p>
              </div>
              <span className="text-xs text-teal-600 font-medium bg-teal-50 px-2.5 py-1 rounded-full">
                Setembro
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={salesData} margin={{ left: -10, right: 0, top: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0d9488" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickFormatter={(v) => `${v}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  fill="url(#tealGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#0d9488", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Pizza */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Produtos mais vendidos</h2>
              <p className="text-xs text-gray-400 mt-0.5">Distribuição por categoria</p>
            </div>
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={productsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {productsData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}%`, ""]}
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #f0f0f0",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full space-y-2 mt-2">
                {productsData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: item.color }}
                      />
                      <span className="text-gray-500">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-700">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Últimos Pedidos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-700">Últimos Pedidos</h2>
            <button className="text-xs text-teal-600 font-medium hover:underline">
              Ver todos
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 font-medium border-b border-gray-50">
                  <th className="text-left px-6 py-3">Data</th>
                  <th className="text-left px-6 py-3">Cliente</th>
                  <th className="text-left px-6 py-3">Valor</th>
                  <th className="text-left px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3.5 text-gray-400 text-xs">{order.date}</td>
                    <td className="px-6 py-3.5 font-medium text-gray-700">{order.client}</td>
                    <td className="px-6 py-3.5 font-semibold text-gray-800">{order.value}</td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
