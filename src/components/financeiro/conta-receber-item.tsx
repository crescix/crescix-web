"use client";

import { Check, Pencil, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  ContaReceber,
  CATEGORIA_RECEBER_LABEL,
  STATUS_CONTA_LABEL,
  STATUS_CONTA_STYLES,
  formatBRL,
  formatDateBR,
} from "@/lib/data/financeiro";

interface ContaReceberItemProps {
  data: ContaReceber;
  onEdit: (conta: ContaReceber) => void;
  onDelete: (conta: ContaReceber) => void;
  onMarkReceived: (conta: ContaReceber) => void;
  isMarkingReceived?: boolean;
}

export function ContaReceberItem({
  data,
  onEdit,
  onDelete,
  onMarkReceived,
  isMarkingReceived,
}: ContaReceberItemProps) {
  const isReceived = data.status === "RECEBIDO";
  const isOverdue = data.status === "ATRASADO";

  return (
    <TableRow className="border-b border-white/5 hover:bg-white/5 transition-colors">
      <TableCell className="text-white text-sm font-medium max-w-xs truncate">
        {data.descricao}
      </TableCell>
      <TableCell className="text-white/70 text-sm">
        {data.clienteId ? (
          <span className="text-white/60 font-mono text-xs">
            #{data.clienteId.slice(0, 6)}
          </span>
        ) : (
          <span className="text-white/30">—</span>
        )}
      </TableCell>
      <TableCell className="text-white/70 text-sm">
        {CATEGORIA_RECEBER_LABEL[data.categoria] ?? data.categoria}
      </TableCell>
      <TableCell className="text-sm">
        <span className={isOverdue ? "text-red-400/80 font-medium" : "text-white/70"}>
          {formatDateBR(data.vencimento)}
        </span>
      </TableCell>
      <TableCell className="text-white text-sm font-semibold text-right tabular-nums">
        {formatBRL(data.valor)}
      </TableCell>
      <TableCell>
        <Badge
          className={`${STATUS_CONTA_STYLES[data.status] ?? "bg-white/10 text-white/60 border-white/20"} border text-xs font-medium`}
        >
          {STATUS_CONTA_LABEL[data.status] ?? data.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-center gap-1">
          {!isReceived && (
            <button
              title="Marcar como recebido"
              onClick={() => onMarkReceived(data)}
              disabled={isMarkingReceived}
              className="p-2 hover:bg-green-500/10 rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMarkingReceived ? (
                <Loader2 className="h-4 w-4 text-green-400 animate-spin" />
              ) : (
                <Check className="h-4 w-4 text-white/40 group-hover:text-green-400 transition-colors" />
              )}
            </button>
          )}

          <button
            title="Editar conta"
            onClick={() => onEdit(data)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
          >
            <Pencil className="h-4 w-4 text-white/40 group-hover:text-green-400 transition-colors" />
          </button>

          <button
            title="Excluir conta"
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
