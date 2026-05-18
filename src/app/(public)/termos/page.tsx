import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

/**
 * Termos de Uso da CrescIX. Linguagem clara, sem latim jurídico
 * desnecessário. Cobre o essencial pra um SaaS em estágio inicial:
 * conta do usuário, propriedade dos dados, limitação de
 * responsabilidade, foro.
 */

const UPDATED_AT = "18 de maio de 2026";

export const metadata = {
    title: "Termos de Uso — CrescIX",
    description:
        "Condições para uso da plataforma CrescIX. Conta, dados, responsabilidades e foro.",
};

export default function TermosPage() {
    return (
        <div className="w-full min-h-screen bg-app text-white">
            <div className="max-w-3xl mx-auto px-5 md:px-8 py-10 md:py-16">

                {/* ── Header ─────────────────────────────────────── */}
                <header className="mb-10">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-brand transition-colors mb-6"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Voltar
                    </Link>

                    <div className="flex items-start gap-3 mb-3">
                        <div className="h-11 w-11 rounded-2xl bg-brand/15 border border-brand/25 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-5 w-5 text-brand" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-brand font-semibold mb-1">
                                Termos
                            </p>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                                Termos de Uso
                            </h1>
                            <p className="text-sm text-white/45 mt-1">
                                Última atualização: {UPDATED_AT}
                            </p>
                        </div>
                    </div>
                </header>

                {/* ── Conteúdo ────────────────────────────────────── */}
                <article className="space-y-8 text-[15px] leading-relaxed text-white/75">

                    <Intro>
                        Este documento define as regras de uso da plataforma
                        CrescIX. Ao criar uma conta, você concorda com tudo o
                        que está aqui. Tentamos escrever em português claro,
                        sem latim — se algo ficar confuso, fala com a gente.
                    </Intro>

                    <Section titulo="1. O serviço">
                        <p>
                            CrescIX é uma plataforma web e um bot Telegram pra
                            gestão financeira de pequenos negócios. Permite
                            registrar vendas, despesas, compras, gerar
                            relatórios e ver análises geradas por IA.
                        </p>
                    </Section>

                    <Section titulo="2. Sua conta">
                        <Ul>
                            <li>
                                Você precisa ter pelo menos 18 anos e poder
                                celebrar contratos pra criar uma conta.
                            </li>
                            <li>
                                Os dados informados no cadastro devem ser
                                verdadeiros e atualizados.
                            </li>
                            <li>
                                Você é responsável por manter sua senha em
                                segredo. Tudo que acontecer na sua conta é de
                                sua responsabilidade.
                            </li>
                            <li>
                                Se notar acesso indevido, comunique imediatamente
                                pelo e-mail de suporte.
                            </li>
                            <li>
                                Cada conta pertence a uma pessoa ou um negócio.
                                Compartilhar credenciais é proibido.
                            </li>
                        </Ul>
                    </Section>

                    <Section titulo="3. Uso permitido">
                        <p className="mb-3">
                            Você pode usar a CrescIX pra registrar e analisar
                            as finanças do seu negócio. Não pode usar pra:
                        </p>
                        <Ul>
                            <li>
                                Atividades ilegais ou que ferem direitos de
                                terceiros.
                            </li>
                            <li>
                                Tentar acessar dados de outros usuários, fazer
                                engenharia reversa do app ou explorar falhas
                                de segurança sem autorização.
                            </li>
                            <li>
                                Sobrecarregar os servidores com requisições
                                automatizadas além do necessário.
                            </li>
                            <li>
                                Revender ou repassar acesso à plataforma sem
                                autorização nossa por escrito.
                            </li>
                        </Ul>
                        <p className="mt-3">
                            Violar essas regras nos dá o direito de suspender
                            ou encerrar sua conta sem reembolso.
                        </p>
                    </Section>

                    <Section titulo="4. Seus dados são seus">
                        <p>
                            Tudo que você cadastra na CrescIX (fornecedores,
                            clientes, produtos, lançamentos) pertence a você.
                            Você pode exportar a qualquer momento e, ao
                            encerrar a conta, todos os seus dados são apagados
                            (veja a{" "}
                            <Link href="/privacidade" className="text-brand hover:text-brand-strong">
                                Política de Privacidade
                            </Link>
                            ).
                        </p>
                    </Section>

                    <Section titulo="5. Pagamento">
                        <p>
                            Durante a fase atual (beta), o uso da CrescIX é
                            gratuito. Quando passarmos a cobrar, avisaremos
                            com pelo menos 30 dias de antecedência por e-mail,
                            e você poderá optar por encerrar a conta sem
                            qualquer custo.
                        </p>
                    </Section>

                    <Section titulo="6. Disponibilidade">
                        <p>
                            A gente faz o que está ao nosso alcance pra manter
                            o serviço no ar, mas não garantimos
                            disponibilidade ininterrupta. Manutenções
                            programadas serão avisadas com antecedência quando
                            possível. Eventuais quedas curtas e imprevistas
                            podem ocorrer.
                        </p>
                    </Section>

                    <Section titulo="7. Análises da IA">
                        <p>
                            O recurso &quot;Análise IA&quot; gera observações e
                            sugestões a partir dos seus números. Os resultados
                            são informativos — não substituem aconselhamento
                            contábil, fiscal, jurídico ou financeiro
                            profissional. Use o bom senso.
                        </p>
                    </Section>

                    <Section titulo="8. Limitação de responsabilidade">
                        <Ul>
                            <li>
                                A CrescIX é fornecida &quot;como está&quot;. Fazemos o
                                melhor que podemos, mas não garantimos que vai
                                atender a todos os seus objetivos.
                            </li>
                            <li>
                                Não nos responsabilizamos por decisões de
                                negócio que você tomar com base nos relatórios
                                e análises da plataforma.
                            </li>
                            <li>
                                Faça backup das informações importantes — se
                                bem que mantemos cópias, falhas raras de
                                infraestrutura podem acontecer.
                            </li>
                            <li>
                                Nossa responsabilidade financeira fica
                                limitada ao valor que você pagou pelo serviço
                                nos 12 meses anteriores ao incidente (no beta
                                gratuito, esse limite é zero).
                            </li>
                        </Ul>
                    </Section>

                    <Section titulo="9. Encerramento">
                        <p>
                            Você pode encerrar sua conta a qualquer momento
                            enviando um e-mail pra{" "}
                            <a
                                href="mailto:privacidade@crescix.com.br"
                                className="text-brand hover:text-brand-strong"
                            >
                                privacidade@crescix.com.br
                            </a>
                            . Em até 30 dias após a solicitação, seus dados
                            são apagados. Podemos encerrar sua conta se você
                            violar estes termos — neste caso, te avisamos por
                            e-mail antes.
                        </p>
                    </Section>

                    <Section titulo="10. Atualizações destes termos">
                        <p>
                            Podemos atualizar estes termos. Quando a mudança
                            for significativa, te avisamos por e-mail e na
                            interface antes da nova versão entrar em vigor.
                            Se você continuar usando o serviço após a
                            mudança, considera-se que aceitou.
                        </p>
                    </Section>

                    <Section titulo="11. Foro">
                        <p>
                            Fica eleito o foro da comarca de Santa Rita do
                            Sapucaí, MG, pra dirimir qualquer questão
                            originada destes termos, com renúncia a qualquer
                            outro por mais privilegiado que seja.
                        </p>
                    </Section>

                    <footer className="pt-8 border-t border-white/10 text-sm text-white/45">
                        Dúvidas sobre os termos? Manda um e-mail pra{" "}
                        <a
                            href="mailto:contato@crescix.com.br"
                            className="text-brand hover:text-brand-strong"
                        >
                            contato@crescix.com.br
                        </a>
                        .
                    </footer>
                </article>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVAS DE PROSE (espelham as da página de privacidade)
// ─────────────────────────────────────────────────────────────────────────────

function Intro({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-base md:text-lg text-white/85 leading-relaxed pb-2 border-b border-white/10">
            {children}
        </p>
    );
}

function Section({
    titulo,
    children,
}: {
    titulo: string;
    children: React.ReactNode;
}) {
    return (
        <section className="space-y-3">
            <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                {titulo}
            </h2>
            <div className="space-y-2">{children}</div>
        </section>
    );
}

function Ul({ children }: { children: React.ReactNode }) {
    return (
        <ul className="space-y-2 list-disc list-outside pl-5 marker:text-brand">
            {children}
        </ul>
    );
}
