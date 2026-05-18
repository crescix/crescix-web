"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

/**
 * Banner LGPD que aparece na primeira visita.
 *
 * CrescIX hoje só usa cookies/localStorage estritamente necessários (JWT
 * de sessão, preferências de UI). Por isso o banner é discreto, com 1
 * único botão "Entendi". Não há "Recusar" porque nada é opcional — se o
 * usuário recusasse, o serviço não funcionaria. Quando entrarem analytics
 * ou cookies de terceiros, este componente precisa ganhar "Personalizar".
 *
 * Persistência: localStorage. Aparece exatamente uma vez por dispositivo.
 */

const ACCEPTED_KEY = "crescix:lgpd-cookies-accepted";

export function CookieBanner() {
    // Começa como `null` pra evitar flash de banner antes do hydrate.
    // Só passa pra true/false depois de ler o localStorage no client.
    const [visivel, setVisivel] = useState<boolean | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;
        setVisivel(localStorage.getItem(ACCEPTED_KEY) !== "1");
    }, []);

    function aceitar() {
        try {
            localStorage.setItem(ACCEPTED_KEY, "1");
        } catch {
            // localStorage desabilitado (modo privado em alguns navegadores).
            // Ignoramos silenciosamente — o banner some até o reload, o que
            // já é melhor que ficar travado.
        }
        setVisivel(false);
    }

    if (!visivel) return null;

    return (
        <div
            role="region"
            aria-label="Aviso de cookies"
            className="
                fixed inset-x-3 bottom-3 md:inset-x-auto md:right-4 md:left-auto
                md:bottom-4 md:max-w-md
                z-50
                animate-slide-up
            "
        >
            <div
                className="
                    bg-elevated/95 backdrop-blur-md
                    border border-white/10
                    rounded-2xl
                    p-4 md:p-5
                    shadow-2xl shadow-black/40
                "
            >
                <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-brand/15 flex items-center justify-center flex-shrink-0">
                        <Cookie className="h-4 w-4 text-brand" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">
                            Usamos só o essencial
                        </p>
                        <p className="text-xs text-white/55 mt-1 leading-relaxed">
                            Guardamos no seu navegador apenas o necessário pra
                            te manter logado e lembrar de algumas preferências.
                            Sem rastreamento, sem analytics, sem anúncios.{" "}
                            <Link
                                href="/privacidade"
                                className="text-brand hover:text-brand-strong underline underline-offset-2"
                            >
                                Mais detalhes
                            </Link>
                            .
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={aceitar}
                        aria-label="Fechar aviso"
                        className="
                            h-7 w-7 inline-flex items-center justify-center
                            rounded-lg
                            text-white/40 hover:text-white/80
                            hover:bg-white/5
                            transition-colors
                            flex-shrink-0
                        "
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <button
                    type="button"
                    onClick={aceitar}
                    className="
                        mt-4 w-full
                        h-9 px-4
                        bg-brand hover:bg-brand-strong
                        text-white text-sm font-semibold
                        rounded-lg
                        transition-colors
                    "
                >
                    Entendi
                </button>
            </div>
        </div>
    );
}
