"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    CheckCircle2,
    Circle,
    Sparkles,
    Smartphone,
    MessageCircle,
    ArrowRight,
    X,
} from "lucide-react";
import { getTelegramStatus } from "@/services/telegram";

interface OnboardingCardProps {
    /** Quantidade total de "lançamentos" (contas pagar+receber+pedidos). */
    totalLancamentos: number;
    /** Indica que os dados de lançamentos terminaram de carregar. */
    mounted: boolean;
}

interface PassoCheck {
    id: string;
    titulo: string;
    descricao: string;
    icon: React.ComponentType<{ className?: string }>;
    feito: boolean;
    cta?: { texto: string; href: string };
}

const DISMISS_KEY = "crescix:onboarding-dismissed";

/**
 * Card de onboarding pra usuário novo.
 *
 * Aparece no topo do dashboard quando há algo pendente do tour inicial:
 *   1. Vincular Telegram (decisivo — é o killer feature)
 *   2. Mandar primeira mensagem pro bot (depende do passo 1)
 *
 * Quando o usuário concluiu todos os passos OU clicou em "dispensar", o
 * card some pra sempre (persistido em localStorage). Não é didático demais
 * — quem já entendeu não precisa ver de novo.
 *
 * Renderiza `null` se:
 *   - O usuário dispensou explicitamente
 *   - Já fez tudo (tem Telegram + tem ao menos 1 lançamento)
 *   - Ainda está carregando os dados (não pisca antes de ter o estado real)
 */
export function OnboardingCard({ totalLancamentos, mounted }: OnboardingCardProps) {
    const [pareado, setPareado] = useState<boolean | null>(null);
    const [dismissed, setDismissed] = useState(false);

    // Carrega estado do pareamento Telegram e re-busca quando o tab volta
    // ao foco. Cobre o caminho: usuário sai pra /perfil (ou outra aba/celular)
    // pra parear, conclui, volta pra esta aba → a checklist atualiza sozinha
    // sem precisar de reload manual.
    useEffect(() => {
        let cancelled = false;

        const buscar = () => {
            getTelegramStatus()
                .then((s) => {
                    if (!cancelled) setPareado(s.paired);
                })
                .catch(() => {
                    // Endpoint falhou (ex.: API offline). Só assume "não pareado"
                    // na PRIMEIRA tentativa — se já tinha estado válido, mantém
                    // pra não fazer o card piscar aparecendo/sumindo.
                    if (!cancelled) {
                        setPareado((atual) => (atual === null ? false : atual));
                    }
                });
        };

        buscar();

        const onVisible = () => {
            if (document.visibilityState === "visible") buscar();
        };
        document.addEventListener("visibilitychange", onVisible);

        return () => {
            cancelled = true;
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, []);

    // Carrega estado de "dispensado" do localStorage. Só roda uma vez.
    useEffect(() => {
        if (typeof window === "undefined") return;
        setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    }, []);

    // Loading: não pisca o card antes de ter dados confiáveis.
    if (!mounted || pareado === null) return null;
    if (dismissed) return null;

    const passos: PassoCheck[] = [
        {
            id: "telegram",
            titulo: "Vincular Telegram",
            descricao:
                "Gere um código de 6 dígitos e cole no bot pra usar a CrescIX pelo celular.",
            icon: Smartphone,
            feito: pareado,
            cta: { texto: "Vincular agora", href: "/perfil" },
        },
        {
            id: "primeira-mensagem",
            titulo: "Mandar a primeira mensagem",
            descricao:
                pareado
                    ? 'Diga ao bot algo como "Vendi 4 águas a 3 reais" e veja aparecer aqui.'
                    : "Depois de vincular, mande uma mensagem pro bot e ela já vira lançamento aqui.",
            icon: MessageCircle,
            feito: totalLancamentos > 0,
        },
    ];

    const passosRestantes = passos.filter((p) => !p.feito).length;

    // Tudo concluído: oculta sem precisar persistir. Se voltar pra zero
    // por algum motivo (sem registros + despareou), o card volta sozinho.
    if (passosRestantes === 0) return null;

    const handleDismiss = () => {
        localStorage.setItem(DISMISS_KEY, "1");
        setDismissed(true);
    };

    return (
        <section
            className="
                relative overflow-hidden
                bg-gradient-to-br from-brand/15 via-brand/5 to-transparent
                border border-brand/25
                rounded-3xl
                p-6 md:p-7
                animate-fade-in
            "
        >
            {/* Glow decorativo */}
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-brand/10 rounded-full blur-3xl pointer-events-none" />

            {/* Botão dispensar */}
            <button
                type="button"
                onClick={handleDismiss}
                aria-label="Dispensar guia de boas-vindas"
                className="
                    absolute top-4 right-4
                    h-7 w-7 inline-flex items-center justify-center
                    rounded-lg
                    text-white/40 hover:text-white/80
                    hover:bg-white/5
                    transition-colors
                "
            >
                <X className="h-4 w-4" />
            </button>

            <div className="relative space-y-5">
                {/* Cabeçalho */}
                <div className="flex items-start gap-3 pr-8">
                    <div className="h-10 w-10 rounded-xl bg-brand/15 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-5 w-5 text-brand" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-brand font-semibold mb-1">
                            Bem-vindo
                        </p>
                        <h2 className="text-lg md:text-xl font-bold text-white">
                            Falta pouco pra você começar a usar
                        </h2>
                        <p className="text-sm text-white/55 mt-0.5">
                            {passosRestantes === 1
                                ? "Só mais 1 passo pra ter tudo funcionando."
                                : `Faltam ${passosRestantes} passos. Leva uns 2 minutos.`}
                        </p>
                    </div>
                </div>

                {/* Lista de passos */}
                <ol className="space-y-2.5">
                    {passos.map((passo, idx) => (
                        <PassoItem key={passo.id} passo={passo} numero={idx + 1} />
                    ))}
                </ol>
            </div>
        </section>
    );
}

function PassoItem({ passo, numero }: { passo: PassoCheck; numero: number }) {
    const Icon = passo.icon;
    return (
        <li
            className={`
                relative flex items-start gap-3
                p-3.5 rounded-xl
                border transition-colors
                ${passo.feito
                    ? "bg-brand/5 border-brand/20"
                    : "bg-white/5 border-white/10 hover:border-white/15"
                }
            `}
        >
            {/* Status circle */}
            <div className="flex-shrink-0 mt-0.5">
                {passo.feito ? (
                    <CheckCircle2 className="h-5 w-5 text-brand" />
                ) : (
                    <Circle className="h-5 w-5 text-white/30" />
                )}
            </div>

            {/* Conteúdo */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/35 font-mono">
                        {String(numero).padStart(2, "0")}
                    </span>
                    <h3
                        className={`text-sm font-semibold ${
                            passo.feito ? "text-white/60 line-through" : "text-white"
                        }`}
                    >
                        {passo.titulo}
                    </h3>
                </div>
                <p
                    className={`text-xs mt-0.5 ${
                        passo.feito ? "text-white/35" : "text-white/55"
                    }`}
                >
                    {passo.descricao}
                </p>
            </div>

            {/* CTA (só quando não feito) */}
            {!passo.feito && passo.cta && (
                <Link
                    href={passo.cta.href}
                    className="
                        flex-shrink-0 self-center
                        inline-flex items-center gap-1.5
                        h-9 px-3.5
                        bg-brand hover:bg-brand-strong
                        text-white text-xs font-semibold
                        rounded-lg
                        transition-colors
                        group
                    "
                >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{passo.cta.texto}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
            )}
        </li>
    );
}
