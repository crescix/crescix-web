import { forwardRef, type InputHTMLAttributes } from "react";
import { type LucideIcon } from "lucide-react";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    /** Ícone Lucide à esquerda do input. */
    icon: LucideIcon;
    /** Mensagem de erro mostrada abaixo do input. */
    error?: string;
    /** Label flutuante opcional. */
    label?: string;
}

/**
 * Input estilizado pro tema escuro das telas de autenticação.
 *
 *  ┌─────────────────────────────────────┐
 *  │ 🔒  Senha                           │
 *  ├─────────────────────────────────────┤
 *  │ ❗ Senha muito curta                │
 *  └─────────────────────────────────────┘
 *
 * Visual:
 *  - bg-elevated com borda sutil
 *  - foco realça com anel verde (brand)
 *  - ícone à esquerda
 *  - erro vermelho discreto embaixo
 */
export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
    function AuthField({ icon: Icon, error, label, className, ...rest }, ref) {
        return (
            <div className="space-y-1.5">
                {label && (
                    <label
                        htmlFor={rest.id}
                        className="block text-xs font-medium text-white/55 uppercase tracking-wider"
                    >
                        {label}
                    </label>
                )}
                <div className="relative group">
                    <Icon className="
                        absolute left-3.5 top-1/2 -translate-y-1/2
                        h-4 w-4 text-white/40
                        group-focus-within:text-brand
                        transition-colors duration-150
                    " />
                    <input
                        ref={ref}
                        {...rest}
                        className={[
                            "w-full",
                            "pl-10 pr-3 py-3",
                            "bg-elevated",
                            "border border-white/8",
                            "rounded-lg",
                            "text-white text-sm",
                            "placeholder:text-white/30",
                            "focus:outline-none",
                            "focus:border-brand/50",
                            "focus:ring-2 focus:ring-brand/15",
                            "transition-all duration-150",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            error ? "border-red-400/40 focus:border-red-400/60 focus:ring-red-400/15" : "",
                            className ?? "",
                        ].filter(Boolean).join(" ")}
                    />
                </div>
                {error && (
                    <p className="text-xs text-red-400 px-1">{error}</p>
                )}
            </div>
        );
    }
);
