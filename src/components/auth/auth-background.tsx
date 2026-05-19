"use client";

/**
 * Fundo animado das telas de autenticação (login, cadastro, esqueci/redefinir senha).
 *
 * Camadas, de baixo pra cima:
 *  1. Gradiente base verde/teal escuro (sem animação, dá o tom).
 *  2. Três "orbs" desfocados que flutuam em loops longos (15-22s), simulando
 *     aurora boreal sutil. Animações em globals.css pra ficar leve.
 *  3. Grade pontilhada de baixa opacidade (tech feel, igual a landing).
 *  4. Vinheta radial preta nas bordas pra suavizar e dar profundidade.
 *
 * As animações respeitam `prefers-reduced-motion` automaticamente via
 * a media query global em globals.css.
 */
export function AuthBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* 1. Gradiente base */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse at 20% 30%, #0f3a2e 0%, transparent 55%), " +
                        "radial-gradient(ellipse at 80% 70%, #093a3f 0%, transparent 50%), " +
                        "linear-gradient(135deg, #0B1622 0%, #0d2030 50%, #0B1622 100%)",
                }}
            />

            {/* 2. Orbs animados */}
            <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-brand/15 blur-3xl animate-auth-orb-1" />
            <div className="absolute bottom-0 -right-20 h-[28rem] w-[28rem] rounded-full bg-accent-deep/30 blur-3xl animate-auth-orb-2" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-brand-soft/20 blur-3xl animate-auth-orb-3" />

            {/* 3. Grade pontilhada */}
            <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                    backgroundImage:
                        "radial-gradient(rgba(255,255,255,0.45) 1px, transparent 1px)",
                    backgroundSize: "22px 22px",
                }}
            />

            {/* 4. Vinheta nas bordas */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.45) 100%)",
                }}
            />
        </div>
    );
}
