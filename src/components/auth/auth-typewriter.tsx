"use client";

import { useEffect, useState } from "react";

/**
 * Animação de máquina de escrever que cicla entre frases.
 *
 * Mostra exemplos do que o usuário fala pro bot, conectando visualmente
 * a tela de login ao produto. Cada frase é "digitada" caractere a
 * caractere, fica visível por uns segundos, e depois é "apagada" antes
 * da próxima. Loop infinito.
 *
 * Sem libs externas — useEffect com setTimeout encadeado é o suficiente
 * e mantém o bundle leve. Respeita prefers-reduced-motion via globals.css
 * (a caret simplesmente para de piscar; o texto continua mudando, mas
 * sem efeito de digitação — em "instantâneo").
 */

const MENSAGENS = [
    "Vendi 4 águas a 3 reais cada",
    "Paguei 150 reais de aluguel",
    "Comprei 3 caixas de farinha por 90 reais",
    "Recebi 50 reais do João",
    "Relatório de vendas da semana",
];

const VELOCIDADE_DIGITAR = 50;  // ms por caractere
const VELOCIDADE_APAGAR = 25;
const PAUSA_FINAL = 2200;        // ms parado após digitar
const PAUSA_INICIAL = 400;       // ms parado entre frases (após apagar)

type Fase = "digitando" | "parado" | "apagando";

export function AuthTypewriter() {
    const [indice, setIndice] = useState(0);
    const [texto, setTexto] = useState("");
    const [fase, setFase] = useState<Fase>("digitando");

    useEffect(() => {
        const alvo = MENSAGENS[indice]!;
        let timeoutId: ReturnType<typeof setTimeout>;

        if (fase === "digitando") {
            if (texto.length < alvo.length) {
                timeoutId = setTimeout(() => {
                    setTexto(alvo.slice(0, texto.length + 1));
                }, VELOCIDADE_DIGITAR);
            } else {
                timeoutId = setTimeout(() => setFase("parado"), PAUSA_FINAL);
            }
        } else if (fase === "parado") {
            timeoutId = setTimeout(() => setFase("apagando"), 0);
        } else if (fase === "apagando") {
            if (texto.length > 0) {
                timeoutId = setTimeout(() => {
                    setTexto(texto.slice(0, -1));
                }, VELOCIDADE_APAGAR);
            } else {
                timeoutId = setTimeout(() => {
                    setIndice((i) => (i + 1) % MENSAGENS.length);
                    setFase("digitando");
                }, PAUSA_INICIAL);
            }
        }

        return () => clearTimeout(timeoutId);
    }, [texto, fase, indice]);

    return (
        <div
            className="
                font-mono text-sm md:text-base text-brand/90
                bg-black/30 backdrop-blur-sm
                border border-white/10
                rounded-lg px-4 py-3
                shadow-lg
                min-h-[44px] md:min-h-[48px]
                flex items-center
                max-w-md
            "
            aria-live="polite"
        >
            <span className="text-white/40 mr-2 select-none">$</span>
            <span className="text-white/90">{texto}</span>
            <span className="ml-0.5 inline-block w-2 h-4 md:h-5 bg-brand animate-auth-caret" />
        </div>
    );
}
