"use client";

import { Check, Pencil, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  ContaPagar,
  CATEGORIA_PAGAR_LABEL,
  STATUS_CONTA_LABEL,
  STATUS_CONTA_STYLES,
  formatBRL,
  formatDateBR,
} from "@/lib/data/financeiro";

interface ContaPagarItemProps {
  data: ContaPagar;
  onEdit: (conta: ContaPagar) => void;
  onDelete: (conta: ContaPagar) => void;
  onMarkPaid: (conta: ContaPagar) => void;
  isMarkingPaid?: boolean;
}

export function ContaPagarItem({
  data,
  onEdit,
  onDelete,
  onMarkPaid,
  isMarkingPaid,
}: ContaPagarItemProps) {
  const isPaid = data.status === "PAGO";
  const isOverdue = data.status === "ATRASADO";

  return (
    <TableRow className="border-b border-white/5 hover:bg-white/5 transition-colors">
      <TableCell className="text-white text-sm font-medium max-w-xs truncate">
        {data.descricao}
      </TableCell>
      <TableCell className="text-white/70 text-sm">
        {/* Backend hoje não popula fornecedorNome — apenas o id. */}
        {data.fornecedorId ? (
          <span className="text-white/60 font-mono text-xs">
            #{data.fornecedorId.slice(0, 6)}
          </span>
        ) : (
          <span className="text-white/30">—</span>
        )}
      </TableCell>
      <TableCell className="text-white/70 text-sm">
        {CATEGORIA_PAGAR_LABEL[data.categoria] ?? data.categoria}
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
        {/*
          Ações: marcar pago / editar / excluir.

          Antes os ícones eram cinza claro (text-white/40) e só ficavam
          coloridos no hover — em mobile sem hover, ficavam invisíveis e
          o cliente nem percebia que dava pra cancelar uma transação.

          Agora cada botão tem cor de fundo sutil sempre visível
          (bg-X/10) + ícone na cor própria (verde / branco / vermelho)
          + texto curto ao lado em telas md+. Em mobile fica só o ícone
          mas com a "cápsula" colorida — bem mais óbvio que é clicável.
        */}
        <div className="flex items-center justify-center gap-1.5">
          {!isPaid && (
            <button
              title="Marcar como pago"
              aria-label="Marcar como pago"
              onClick={() => onMarkPaid(data)}
              disabled={isMarkingPaid}
              className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMarkingPaid ? (
                <Loader2 className="h-4 w-4 text-green-400 animate-spin" />
              ) : (
                <Check className="h-4 w-4 text-green-400" />
              )}
              <span className="hidden md:inline text-xs text-green-300 font-medium">Paguei</span>
            </button>
          )}

          <button
            title="Editar conta"
            aria-label="Editar conta"
            onClick={() => onEdit(data)}
            className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <Pencil className="h-4 w-4 text-white/70" />
            <span className="hidden md:inline text-xs text-white/70 font-medium">Editar</span>
          </button>

          <button
            title="Excluir conta"
            aria-label="Excluir conta"
            onClick={() => onDelete(data)}
            className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
          >
            <Trash2 className="h-4 w-4 text-red-400" />
            <span className="hidden md:inline text-xs text-red-300 font-medium">Excluir</span>
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
}
