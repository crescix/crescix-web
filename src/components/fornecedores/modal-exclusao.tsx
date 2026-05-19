"use client";

import { createPortal } from "react-dom";
import { useEffect } from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Fornecedor } from "@/lib/data/fornecedores";

interface ModalExclusaoProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  fornecedor: Fornecedor | null;
}

export function ModalExclusao({
  isOpen,
  onOpenChange,
  onConfirm,
  fornecedor,
}: ModalExclusaoProps) {
  if (!isOpen || !fornecedor) return null;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onOpenChange]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 rounded-lg"
      onClick={() => onOpenChange(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-primary border border-white/10 text-white rounded-xl  max-w-md shadow-2xl overflow-hidden"
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold">Confirmar Exclusão</h2>
            <p className="text-white/60 text-sm mt-1">Esta ação é irreversível.</p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          <div className="flex gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">
              Atenção: Você tem certeza que deseja excluir o fornecedor abaixo?
              Esta ação não poderá ser desfeita.
            </p>
          </div>

          <div className="mt-6">
            <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">
              Dados do Fornecedor
            </p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-[100px_1fr] gap-3">
                <span className="text-xs text-white/50 font-bold uppercase">Razão Social</span>
                <span className="text-white font-medium">{fornecedor.razaoSocial}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3">
                <span className="text-xs text-white/50 font-bold uppercase">CNPJ</span>
                <span className="text-white font-medium">{fornecedor.cnpj}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3">
                <span className="text-xs text-white/50 font-bold uppercase">Endereço</span>
                <span className="text-white/80 text-sm leading-snug">{fornecedor.endereco}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 bg-white/5 px-6 py-5 flex   gap-3 sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="border border-white/10 text-white hover:bg-white/10 sm:w-auto"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className=" sm:w-auto"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Sim, Excluir
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}