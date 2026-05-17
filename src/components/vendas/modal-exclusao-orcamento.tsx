"use client";

import { createPortal } from "react-dom";
import { useEffect } from "react";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Orcamento, isoToDisplay } from "@/lib/data/orcamentos";

interface ModalExclusaoOrcamentoProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  orcamento: Orcamento | null;
  isDeleting?: boolean;
}

export function ModalExclusaoOrcamento({
  isOpen, onOpenChange, onConfirm, orcamento, isDeleting = false,
}: ModalExclusaoOrcamentoProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) onOpenChange(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onOpenChange, isDeleting]);

  if (!isOpen || !orcamento) return null;
  const valor = Number(orcamento.valorTotal);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={() => !isDeleting && onOpenChange(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-primary border border-white/10 text-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold">Confirmar Exclusão</h2>
            <p className="text-white/60 text-sm mt-1">Esta ação é irreversível.</p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="text-white/50 hover:text-white transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">
              Você tem certeza que deseja excluir este orçamento? Esta ação não poderá ser desfeita.
            </p>
          </div>

          <div className="mt-6">
            <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">
              Dados do Orçamento
            </p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
              <div className="grid grid-cols-[110px_1fr] gap-3">
                <span className="text-xs text-white/50 font-bold uppercase">Nº Orçamento</span>
                <span className="text-white font-mono font-medium">{orcamento.numero}</span>
              </div>
              <div className="grid grid-cols-[110px_1fr] gap-3">
                <span className="text-xs text-white/50 font-bold uppercase">Cliente</span>
                <span className="text-white font-medium">{orcamento.clienteNome}</span>
              </div>
              <div className="grid grid-cols-[110px_1fr] gap-3">
                <span className="text-xs text-white/50 font-bold uppercase">Valor</span>
                <span className="text-white font-medium">
                  R$ {valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="grid grid-cols-[110px_1fr] gap-3">
                <span className="text-xs text-white/50 font-bold uppercase">Validade</span>
                <span className="text-white/80 text-sm">{isoToDisplay(orcamento.validade)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 bg-white/5 px-6 py-5 flex gap-3 justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="border border-white/10 text-white hover:bg-white/10"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            {isDeleting ? "Excluindo..." : "Sim, Excluir"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
