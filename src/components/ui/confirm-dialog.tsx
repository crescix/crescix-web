"use client";

import { createPortal } from "react-dom";
import { useEffect } from "react";
import {
    AlertTriangle,
    Loader2,
    Trash2,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Diálogo de confirmação genérico — usado pelas 8 telas que antes tinham
 * o próprio modal de exclusão. Centraliza:
 *
 *   - portal pro <body> (z-index correto independente do contexto)
 *   - cancelamento por Esc, click fora ou botão X
 *   - bloqueio dos cancelamentos enquanto a confirmação está em curso
 *     (evita usuário fechar no meio do delete)
 *   - dois variants: "destructive" (vermelho) e "warning" (âmbar)
 *
 * API pensada pros dois shapes que existiam antes:
 *
 *   1. Simples: title + description (string ou JSX com highlights)
 *   2. Rico: + alert callout + preview chave/valor
 *
 * Ambos os shapes ficam num único componente porque a diferença é só de
 * conteúdo opcional, não estrutural.
 */

export interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void | Promise<void>;
    /** Indica que a ação está em andamento — desabilita cancelamento. */
    isConfirming?: boolean;

    /** Título destacado (ex.: "Excluir fornecedor?"). */
    title: string;
    /** Texto principal. Aceita JSX pra incluir destaques (`<strong>`, etc.). */
    description: React.ReactNode;
    /** Callout opcional acima do preview (alerta adicional). */
    alert?: React.ReactNode;
    /**
     * Bloco preview com pares chave/valor — usado pelas exclusões de
     * fornecedor, orçamento e conta pra mostrar dados antes de apagar.
     */
    preview?: Array<{ label: string; value: React.ReactNode }>;

    /** Visual do botão de confirmação. Default: "destructive". */
    variant?: "destructive" | "warning";

    /** Texto do botão de confirmação. Default: "Sim, excluir". */
    confirmLabel?: string;
    /** Texto do botão durante a confirmação. Default: "Excluindo...". */
    confirmingLabel?: string;
    /** Texto do botão de cancelar. Default: "Cancelar". */
    cancelLabel?: string;
    /** Ícone do botão de confirmação. Default: Trash2 pra "destructive". */
    confirmIcon?: React.ReactNode;
}

export function ConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    isConfirming = false,

    title,
    description,
    alert,
    preview,

    variant = "destructive",

    confirmLabel = "Sim, excluir",
    confirmingLabel = "Excluindo...",
    cancelLabel = "Cancelar",
    confirmIcon,
}: ConfirmDialogProps) {
    // Esc fecha (a menos que esteja confirmando).
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !isConfirming) onOpenChange(false);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onOpenChange, isConfirming]);

    if (!open) return null;
    if (typeof document === "undefined") return null;

    const accent =
        variant === "destructive"
            ? {
                  iconBg: "bg-red-500/10",
                  iconColor: "text-red-400",
                  border: "border-red-400/30",
                  alertBg: "bg-red-500/10",
                  alertText: "text-red-300",
              }
            : {
                  iconBg: "bg-amber-500/10",
                  iconColor: "text-amber-400",
                  border: "border-amber-400/30",
                  alertBg: "bg-amber-500/10",
                  alertText: "text-amber-300",
              };

    const defaultIcon =
        variant === "destructive" ? (
            <Trash2 className="mr-2 h-4 w-4" />
        ) : (
            <AlertTriangle className="mr-2 h-4 w-4" />
        );

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => !isConfirming && onOpenChange(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-primary border border-white/10 text-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
            >
                {/* Cabeçalho */}
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className={`${accent.iconBg} rounded-xl p-2.5`}>
                            <AlertTriangle className={`w-5 h-5 ${accent.iconColor}`} />
                        </div>
                        <div>
                            <h2
                                id="confirm-dialog-title"
                                className="text-base font-bold text-white"
                            >
                                {title}
                            </h2>
                            <p className="text-xs text-white/45 mt-0.5">
                                Essa ação não tem volta.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => !isConfirming && onOpenChange(false)}
                        disabled={isConfirming}
                        aria-label="Fechar"
                        className="text-white/50 hover:text-white transition-colors disabled:opacity-30"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Corpo */}
                <div className="p-6 space-y-4">
                    {/* Descrição principal */}
                    <div className="text-sm text-white/70 leading-relaxed">
                        {description}
                    </div>

                    {/* Alerta opcional */}
                    {alert && (
                        <div
                            className={`flex gap-3 ${accent.alertBg} border ${accent.border} rounded-xl p-3.5 ${accent.alertText} text-sm`}
                        >
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <div>{alert}</div>
                        </div>
                    )}

                    {/* Preview chave/valor opcional */}
                    {preview && preview.length > 0 && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2.5">
                            {preview.map((item, i) => (
                                <div
                                    key={i}
                                    className="grid grid-cols-[110px_1fr] gap-3 items-start"
                                >
                                    <span className="text-[11px] text-white/50 font-bold uppercase tracking-wider">
                                        {item.label}
                                    </span>
                                    <span className="text-sm text-white">
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Rodapé com ações */}
                <div className="border-t border-white/10 bg-white/5 px-6 py-4 flex gap-3 justify-end">
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={isConfirming}
                        onClick={() => onOpenChange(false)}
                        className="border border-white/10 text-white/70 hover:bg-white/5 disabled:opacity-50"
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        type="button"
                        variant={variant === "destructive" ? "destructive" : "default"}
                        disabled={isConfirming}
                        onClick={onConfirm}
                        className={
                            variant === "warning"
                                ? "bg-amber-500 hover:bg-amber-400 text-black font-semibold"
                                : ""
                        }
                    >
                        {isConfirming ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {confirmingLabel}
                            </>
                        ) : (
                            <>
                                {confirmIcon ?? defaultIcon}
                                {confirmLabel}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
}
