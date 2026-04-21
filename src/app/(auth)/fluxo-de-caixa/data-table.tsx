"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  SlidersHorizontal,
} from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

const STATUS_OPTIONS = [
  { label: "Todos",     value: "" },
  { label: "Pago",      value: "pago" },
  { label: "Aberto",    value: "aberto" },
  { label: "Cancelado", value: "cancelado" },
]

const PERIODO_OPTIONS = [
  { label: "Todos os períodos", value: "" },
  { label: "Mês atual",        value: "mes" },
  { label: "Últimos 7 dias",   value: "7dias" },
  { label: "Últimos 30 dias",  value: "30dias" },
]

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("")
  const [periodoFilter, setPeriodoFilter] = React.useState("")

  // Filtra os dados antes de passar para a tabela
  const filteredData = React.useMemo(() => {
    let result = [...data] as any[]

    if (globalFilter) {
      result = result.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(globalFilter.toLowerCase())
        )
      )
    }

    if (statusFilter) {
      result = result.filter((row) =>
        String(row.status).toLowerCase() === statusFilter
      )
    }

    if (periodoFilter) {
      const hoje = new Date()
      result = result.filter((row) => {
        const data = new Date(row.vencimento)
        if (periodoFilter === "7dias") {
          const limite = new Date(hoje)
          limite.setDate(hoje.getDate() - 7)
          return data >= limite
        }
        if (periodoFilter === "30dias") {
          const limite = new Date(hoje)
          limite.setDate(hoje.getDate() - 30)
          return data >= limite
        }
        if (periodoFilter === "mes") {
          return (
            data.getMonth() === hoje.getMonth() &&
            data.getFullYear() === hoje.getFullYear()
          )
        }
        return true
      })
    }

    return result
  }, [data, globalFilter, statusFilter, periodoFilter])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: { columnFilters },
    initialState: { pagination: { pageSize: 8 } },
  })

  return (
    <div className="space-y-4">

      {/* Barra de filtros */}
      <div className="flex flex-col sm:flex-row gap-3">

        {/* Busca */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por descrição, categoria..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>

        {/* Período */}
        <div className="relative">
          <select
            value={periodoFilter}
            onChange={(e) => setPeriodoFilter(e.target.value)}
            className="appearance-none pl-4 pr-8 py-2.5 text-sm bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
          >
            {PERIODO_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <SlidersHorizontal className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>

        {/* Status */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-4 pr-8 py-2.5 text-sm bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.value === "" ? "Status: Todos" : opt.label}
              </option>
            ))}
          </select>
          <SlidersHorizontal className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>

      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-100">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-50">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50/60 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-32 text-center text-sm text-gray-400"
                >
                  Nenhum resultado encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-gray-400">
          {filteredData.length} registro(s) •{" "}
          Página {table.getState().pagination.pageIndex + 1} de{" "}
          {Math.max(1, table.getPageCount())}
        </p>
        <div className="flex items-center gap-1">
          {[
            { icon: ChevronsLeft,  action: () => table.setPageIndex(0),      disabled: !table.getCanPreviousPage() },
            { icon: ChevronLeft,   action: () => table.previousPage(),        disabled: !table.getCanPreviousPage() },
            { icon: ChevronRight,  action: () => table.nextPage(),            disabled: !table.getCanNextPage() },
            { icon: ChevronsRight, action: () => table.setPageIndex(table.getPageCount() - 1), disabled: !table.getCanNextPage() },
          ].map(({ icon: Icon, action, disabled }, i) => (
            <button
              key={i}
              onClick={action}
              disabled={disabled}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
