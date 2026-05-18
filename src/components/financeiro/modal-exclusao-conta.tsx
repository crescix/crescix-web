"use client";

import { createPortal } from "react-dom";
import { useEffect } from "react";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ContaPagar,
  ContaReceber,
  CATEGORIA_PAGAR_LABEL,
  CATEGORIA_RECEBER_LABEL,
  formatBRL,
  formatDateBR,
} from "@/lib/data/financeiro";

interface ModalExclusaoContaProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  conta: ContaPagar | ContaReceber | null;
  tipo?: "pagar" | "receber";
  isDeleting?: boolean;
}

export function ModalExclusaoConta({
  isOpen,
  onOpenChange,
  onConfirm,
  conta,
  tipo = "pagar",
  isDeleting = false,
}: ModalExclusaoContaProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) onOpenChange(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onOpenChange, isDeleting]);

  if (!isOpen || !conta) return null;

  const categoriaLabel =
    tipo === "receber"
      ? (CATEGORIA_RECEBER_LABEL as Record<string, string>)[conta.categoria] ??
        conta.categoria
      : (CATEGORIA_PAGAR_LABEL as Record<string, string>)[conta.categoria] ??
        conta.categoria;

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
            <h2 className="text-xl font-bold">
              Excluir conta a {tipo === "receber" ? "receber" : "pagar"}?
            </h2>
            <p className="text-white/60 text-sm mt-1">Essa ação não tem volta.</p>
          </div>
          <button
            onClick={() => !isDeleting && onOpenChange(false)}
            disabled={isDeleting}
            className="text-white/50 hover:text-white transition-colors disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-3 bg-red-500/10 border border-red-400/30 rounded-xl p-4 text-red-300">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">
              Essa conta vai sumir da lista e dos relatórios. Se já foi{" "}
              {tipo === "receber" ? "recebida" : "paga"}, o fluxo de caixa do
              período também muda.
            </p>
          </div>

          <div className="mt-6">
            <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">
              Dados da conta
            </p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
              <div className="grid grid-cols-[110px_1fr] gap-3">
                <span className="text-xs text-white/50 font-bold uppercase">Descrição</span>
                <span className="text-white font-medium">{conta.descricao}</span>
              </div>
              <div className="grid grid-cols-[110px_1fr] gap-3">
                <span className="text-xs text-white/50 font-bold uppercase">Categoria</span>
                <span className="text-white font-medium">{categoriaLabel}</span>
              </div>
              <div className="grid grid-cols-[110px_1fr] gap-3">
                <span className="text-xs text-white/50 font-bold uppercase">Valor</span>
                <span className="text-white font-medium">{formatBRL(conta.valor)}</span>
              </div>
              <div className="grid grid-cols-[110px_1fr] gap-3">
                <span className="text-xs text-white/50 font-bold uppercase">Vencimento</span>
                <span className="text-white/80 text-sm">{formatDateBR(conta.vencimento)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 bg-white/5 px-6 py-5 flex gap-3 justify-end">
          <Button
            type="button"
            variant="ghost"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
            className="border border-white/10 text-white hover:bg-white/10 disabled:opacity-50"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={onConfirm}
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
