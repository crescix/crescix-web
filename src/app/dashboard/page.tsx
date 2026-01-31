"use client"

import { 
  Coins, 
  Receipt, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  ArrowDown
} from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, Pie, PieChart, Label } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import { kpiData, salesChartData, productsChartData } from "@/lib/data/dashboard"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"

const chartConfig = {
  sales: {
    label: "Vendas",
    color: "hsl(var(--chart-1))",
  },
  eletronicos: {
    label: "Eletrônicos",
    color: "hsl(var(--chart-1))",
  },
  roupas: {
    label: "Roupas",
    color: "hsl(var(--chart-2))",
  },
  casa: {
    label: "Casa",
    color: "hsl(var(--chart-3))",
  },
  esportes: {
    label: "Esportes",
    color: "hsl(var(--chart-4))",
  },
  outros: {
    label: "Outros",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export default function DashBoard() {

  const { isAuthenticated, isAuthenticating } = useAuth()
  const router = useRouter()

  
  useEffect(() => {
    if (!isAuthenticating && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isAuthenticating, router])

  
  if (isAuthenticating || !isAuthenticated) {
    return null 
  }


  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "coins": return <Coins className="h-8 w-8 mb-2" />;
      case "receipt": return <Receipt className="h-8 w-8 mb-2" />;
      case "box": return <Package className="h-8 w-8 mb-2" />;
      case "cart": return <ShoppingCart className="h-8 w-8 mb-2" />;
      default: return <Coins className="h-8 w-8 mb-2" />;
    }
  }

  const getTotalVisitors = () => {
    return productsChartData.reduce((acc, curr) => acc + curr.visitors, 0)
  }
  const pieDataWithColors = productsChartData.map((item, index) => ({
    ...item,
    fill: index % 2 === 0 ? "var(--secondary)" : "#00000078",
  }))

  return (
    <main className="min-h-screen w-full max-w-7xl bg-secondary p-4 md:p-8">
      <div className="mx-auto w-full space-y-6">
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiData.map((item, index) => (
            <Card key={index} className="border-none bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-[1.02]">
              <CardHeader className="flex flex-col items-center justify-center pb-2">
                <div className="rounded-full bg-white/10 p-3 text-white">
                  {getIcon(item.icon)}
                </div>
                <CardTitle className="text-sm font-medium text-white/80">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold tracking-tight text-white">
                  {item.value}
                </div>
                <p className={`mt-2 text-xs font-medium ${
                   item.title.includes("Estoque") 
                   ? "text-red-300" 
                   : "text-green-300"
                }`}>
                  {item.subtext}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          
          <Card className="border-none bg-primary text-primary-foreground shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">Vendas nos últimos 15 dias</CardTitle>
              <CardDescription className="text-white/60">
                Acompanhamento diário de performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="max-h-[300px] w-full">
                <AreaChart
                  accessibilityLayer
                  data={salesChartData}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value}
                    stroke="rgba(255,255,255,0.5)"
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Area
                    dataKey="sales"
                    type="natural"
                    fill="#fff"
                    fillOpacity={0.5}
                    stroke="hsl(var(--secondary))"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="flex flex-col border-none bg-primary text-primary-foreground shadow-xl">
            <CardHeader className="items-center pb-0">
              <CardTitle className="text-white">Produtos mais vendidos</CardTitle>
              <CardDescription className="text-white/60">Distribuição por categoria</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[300px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={pieDataWithColors}
                    dataKey="visitors"
                    nameKey="product"
                    innerRadius={60}
                    strokeWidth={0}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-white text-3xl font-bold"
                              >
                                {getTotalVisitors().toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-white/60 text-xs"
                              >
                                Total Itens
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

        </div>
      </div>
    </main>
  )
}