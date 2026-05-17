"use client";

import { Copy, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Orcamento,
  STATUS_ORCAMENTO_LABEL,
  STATUS_ORCAMENTO_STYLES,
  isoToDisplay,
} from "@/lib/data/orcamentos";
import Link from "next/link";

interface OrcamentoItemProps {
  data: Orcamento;
  onDelete: (orcamento: Orcamento) => void;
}

export function OrcamentoItem({ data, onDelete }: OrcamentoItemProps) {
  const valor = Number(data.valorTotal);
  return (
    <TableRow className="border-b border-white/5 hover:bg-white/5 transition-colors">
      <TableCell className="text-white font-mono font-medium text-sm">
        {data.numero}
      </TableCell>
      <TableCell className="text-white/70 text-sm">{isoToDisplay(data.data)}</TableCell>
      <TableCell className="text-sm">
        <span className={data.status === "EXPIRADO" ? "text-red-400/70" : "text-white/70"}>
          {isoToDisplay(data.validade)}
        </span>
      </TableCell>
      <TableCell className="text-white text-sm font-medium">{data.clienteNome}</TableCell>
      <TableCell className="text-white text-sm font-semibold text-right tabular-nums">
        R$ {valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
      </TableCell>
      <TableCell>
        <Badge
          className={`${STATUS_ORCAMENTO_STYLES[data.status] ?? "bg-white/10 text-white/60 border-white/20"} border text-xs font-medium`}
        >
          {STATUS_ORCAMENTO_LABEL[data.status] ?? data.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-center gap-1">
          {/* Converter em pedido */}
          <Link href={`/vendas/pedidos/novo?orcamento=${data.id}`}>
            <button
              title="Converter em pedido"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
            >
              <Copy className="h-4 w-4 text-white/40 group-hover:text-green-400 transition-colors" />
            </button>
          </Link>

          {/* Editar */}
          <Link href={`/vendas/orcamentos/${data.id}/editar`}>
            <button
              title="Editar orçamento"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
            >
              <Pencil className="h-4 w-4 text-white/40 group-hover:text-green-400 transition-colors" />
            </button>
          </Link>

          {/* Excluir */}
          <button
            title="Excluir orçamento"
            onClick={() => onDelete(data)}
            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
          >
            <Trash2 className="h-4 w-4 text-white/40 group-hover:text-red-400 transition-colors" />
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
}
