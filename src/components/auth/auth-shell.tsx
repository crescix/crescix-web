import Link from "next/link";
import { AuthBackground } from "./auth-background";
import { AuthTypewriter } from "./auth-typewriter";

interface AuthShellProps {
    /** Título grande do painel direito (formulário). */
    title: string;
    /** Subtítulo cinza embaixo do título. */
    subtitle?: string;
    /** Conteúdo do painel direito (formulário, mensagens). */
    children: React.ReactNode;
    /** Texto no rodapé com link (ex.: "Ainda não possui uma conta?") */
    footerText?: string;
    /** Texto do link no rodapé (ex.: "Cadastre-se") */
    footerLinkText?: string;
    /** Destino do link no rodapé. */
    footerLinkHref?: string;
    /**
     * Headline opcional do painel esquerdo, abaixo do wordmark.
     * Default: "Gestão financeira no automático".
     */
    leftHeadline?: string;
    /**
     * Sub-texto do painel esquerdo, abaixo do headline. Default explica
     * o produto. Use string vazia pra remover.
     */
    leftSubheadline?: string;
}

/**
 * Layout split-screen padrão das telas de autenticação.
 *
 *   ┌─────────────────┬──────────────────┐
 *   │   Brand panel   │   Form panel     │
 *   │  (animado, BG)  │  (dark surface)  │
 *   └─────────────────┴──────────────────┘
 *
 * No mobile, vira coluna única: brand compacto em cima, formulário embaixo.
 *
 * Usado por: login, cadastro, esqueci-senha, redefinir-senha.
 */
export function AuthShell({
    title,
    subtitle,
    children,
    footerText,
    footerLinkText,
    footerLinkHref,
    leftHeadline = "Gestão financeira no automático.",
    leftSubheadline = "Mande áudio ou texto pelo Telegram, a CrescIX entende, registra e organiza tudo em segundos.",
}: AuthShellProps) {
    return (
        <div className="
            w-full max-w-[1100px]
            flex flex-col lg:flex-row
            min-h-[680px]
            bg-surface
            rounded-none md:rounded-3xl
            overflow-hidden
            shadow-2xl shadow-black/40
            ring-1 ring-white/5
        ">
            {/* ── Painel esquerdo (brand + animação) ────────────────────── */}
            <section className="
                relative flex-1
                flex flex-col justify-between
                p-8 lg:p-12
                min-h-[260px] lg:min-h-0
                overflow-hidden
            ">
                <AuthBackground />

                {/* Conteúdo na frente do fundo */}
                <div className="relative z-10 flex flex-col gap-6 lg:gap-8">
                    {/* Wordmark */}
                    <Link href="/" className="inline-flex items-baseline gap-0 group w-fit">
                        <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tighter">
                            CRESC
                        </h1>
                        <h1 className="text-3xl lg:text-4xl font-black text-brand tracking-tighter">
                            IX
                        </h1>
                        <span className="ml-2 text-[10px] text-white/40 font-mono uppercase tracking-widest hidden lg:inline-block translate-y-[-4px]">
                            v0.1
                        </span>
                    </Link>

                    {/* Headline */}
                    <div className="space-y-2 lg:space-y-3 max-w-md">
                        <h2 className="text-2xl lg:text-4xl font-display font-bold text-white leading-tight">
                            {leftHeadline}
                        </h2>
                        {leftSubheadline && (
                            <p className="text-sm lg:text-base text-white/60 leading-relaxed">
                                {leftSubheadline}
                            </p>
                        )}
                    </div>
                </div>

                {/* Typewriter no rodapé do painel esquerdo (desktop) */}
                <div className="relative z-10 hidden lg:flex flex-col gap-3 mt-8">
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">
                        Ao vivo
                    </span>
                    <AuthTypewriter />
                </div>
            </section>

            {/* ── Painel direito (formulário) ───────────────────────────── */}
            <section className="
                flex-[1.05]
                flex flex-col justify-center
                p-8 lg:p-12
                bg-surface
            ">
                <div className="w-full max-w-sm mx-auto space-y-7">
                    <div className="space-y-1.5">
                        <h3 className="text-2xl lg:text-3xl font-display font-bold text-white">
                            {title}
                        </h3>
                        {subtitle && (
                            <p className="text-sm text-white/55">{subtitle}</p>
                        )}
                    </div>

                    {children}

                    {footerText && footerLinkText && footerLinkHref && (
                        <p className="text-center text-sm text-white/55 pt-2 border-t border-white/5">
                            <span className="block pt-4">
                                {footerText}{" "}
                                <Link
                                    href={footerLinkHref}
                                    className="font-semibold text-brand hover:text-brand-strong transition-colors"
                                >
                                    {footerLinkText}
                                </Link>
                            </span>
                        </p>
                    )}
                </div>
            </section>
        </div>
    );
}
