"use client";

import { Check, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { ContaPagar, formatBRL, formatDateBR } from "@/lib/data/financeiro";

const STATUS_STYLES: Record<string, string> = {
  Pendente:  "bg-amber-500/15 text-amber-400 border-amber-500/25",
  Pago:      "bg-green-500/15 text-green-400 border-green-500/25",
  Atrasado:  "bg-red-500/15 text-red-400 border-red-500/25",
  Cancelado: "bg-white/10 text-white/40 border-white/15",
};

interface ContaPagarItemProps {
  data: ContaPagar;
  onEdit: (conta: ContaPagar) => void;
  onDelete: (conta: ContaPagar) => void;
  onMarkPaid: (conta: ContaPagar) => void;
}

export function ContaPagarItem({ data, onEdit, onDelete, onMarkPaid }: ContaPagarItemProps) {
  const isPaid = data.status === "Pago";
  const isOverdue = data.status === "Atrasado";

  return (
    <TableRow className="border-b border-white/5 hover:bg-white/5 transition-colors">
      <TableCell className="text-white text-sm font-medium max-w-xs truncate">
        {data.descricao}
      </TableCell>
      <TableCell className="text-white/70 text-sm">
        {data.fornecedor ?? <span className="text-white/30">—</span>}
      </TableCell>
      <TableCell className="text-white/70 text-sm">{data.categoria}</TableCell>
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
          className={`${STATUS_STYLES[data.status] ?? "bg-white/10 text-white/60 border-white/20"} border text-xs font-medium`}
        >
          {data.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-center gap-1">
          {!isPaid && (
            <button
              title="Marcar como pago"
              onClick={() => onMarkPaid(data)}
              className="p-2 hover:bg-green-500/10 rounded-lg transition-colors group"
            >
              <Check className="h-4 w-4 text-white/40 group-hover:text-green-400 transition-colors" />
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
