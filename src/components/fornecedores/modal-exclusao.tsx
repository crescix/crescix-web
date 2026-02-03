"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { Fornecedor } from "@/lib/data/fornecedores"; // Importando a tipagem que criamos antes

interface ModalExclusaoProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  fornecedor: Fornecedor | null; // O fornecedor selecionado
}

export function ModalExclusao({
  isOpen,
  onOpenChange,
  onConfirm,
  fornecedor,
}: ModalExclusaoProps) {
  
  // Se não houver fornecedor selecionado, não renderiza o conteúdo interno (proteção)
  if (!fornecedor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-primary border-white/10 text-white ">
        
        {/* CABEÇALHO */}
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            Confirmar Exclusão
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Esta ação é irreversível.
          </DialogDescription>
        </DialogHeader>

        {/* ÁREA DE ALERTA (Vermelha) */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 my-2">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">
            Atenção: Você tem certeza que deseja excluir o fornecedor abaixo? 
            Esta ação não poderá ser desfeita.
          </p>
        </div>

        {/* DADOS DO FORNECEDOR (Caixa Cinza/Glass) */}
        <div className="space-y-3">
            <span className="text-sm font-semibold text-white/80">Dados do Fornecedor</span>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                    <span className="text-xs font-bold text-white/50 uppercase">Razão Social:</span>
                    <span className="text-sm text-white font-medium truncate">{fornecedor.razao_social}</span>
                </div>
                
                <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                    <span className="text-xs font-bold text-white/50 uppercase">CNPJ:</span>
                    <span className="text-sm text-white font-medium">{fornecedor.cnpj}</span>
                </div>

                <div className="grid grid-cols-[100px_1fr] gap-2 items-start">
                    <span className="text-xs font-bold text-white/50 uppercase mt-0.5">Endereço:</span>
                    <span className="text-sm text-white/80 leading-tight">{fornecedor.endereco}</span>
                </div>
            </div>
        </div>

        {/* RODAPÉ COM AÇÕES */}
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="border border-white/10 text-white hover:bg-white/10 transition-colors"
          >
            Cancelar
          </Button>
          
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold shadow-[0_0_15px_rgba(239,68,68,0.4)]"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Sim, Excluir
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}