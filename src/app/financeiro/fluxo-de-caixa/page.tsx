import { DataTable } from "./data-table"
import { columns } from "./columns"
import { transactions } from "@/lib/data/fluxo-caixa"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react";

export default function FluxoDeCaixa() {
    const entradas = transactions
        .filter((t) => t.tipo === "receita")
        .reduce((acc, t) => acc + t.valor, 0)

    const saidas = transactions
        .filter((t) => t.tipo === "despesa")
        .reduce((acc, t) => acc + t.valor, 0)

    const saldo = entradas + saidas

    return (
        <main className="min-h-screen bg-secondary p-8 w-full max-w-7xl">
            <div className=" mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-primary">Fluxo de Caixa</h1>
                </div>

                <DataTable columns={columns} data={transactions} />

                <Card className="border-none bg-primary shadow-2xl overflow-hidden mt-8">
                    <CardHeader className="border-b border-white/10 pb-4">
                        <CardTitle className="text-2xl text-white font-bold flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-secondary" />
                            Resumo Financeiro do Período
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-0">
                        <div className="grid grid-cols-1 md:grid-cols-3">

                           
                            <div className="p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/10 hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-2 text-green-400 mb-1">
                                    <ArrowUpCircle className="h-5 w-5" />
                                    <span className="text-sm font-medium uppercase tracking-wider">Entradas</span>
                                </div>
                                <span className="text-2xl font-black text-white">
                                    R$ {entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                            </div>

                            
                            <div className="p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/10 hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-2 text-red-400 mb-1">
                                    <ArrowDownCircle className="h-5 w-5" />
                                    <span className="text-sm font-medium uppercase tracking-wider">Saídas</span>
                                </div>
                                <span className="text-2xl font-black text-white">
                                    R$ {Math.abs(saidas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                            </div>

                            {/* Seção de Saldo (Destaque) */}
                            <div className="p-6 flex flex-col items-center justify-center bg-white/5">
                                <span className="text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-1">
                                    Saldo Líquido
                                </span>
                                <span className={`text-4xl font-black tracking-tighter ${saldo >= 0 ? "text-green-400" : "text-red-400"}`}>
                                    R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                                <div className={`h-1 w-24 mt-2 rounded-full ${saldo >= 0 ? "bg-green-400" : "bg-red-400"} opacity-50`} />
                            </div>

                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}