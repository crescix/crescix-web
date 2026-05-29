import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

/**
 * Política de Privacidade da CrescIX. Texto pensado pra atender o
 * mínimo essencial da LGPD (Lei 13.709/2018) e ser legível por um
 * dono de pequeno negócio — sem latim jurídico.
 *
 * Atualizações deste texto: bumpar UPDATED_AT abaixo e mencionar
 * no card de atualização (o usuário pode pedir pra revisar quando
 * mudar significativamente).
 */

const UPDATED_AT = "27 de maio de 2026";

export const metadata = {
    title: "Política de Privacidade — CrescIX",
    description:
        "Como a CrescIX coleta, usa e protege seus dados. Em conformidade com a LGPD.",
};

export default function PrivacidadePage() {
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
                            <Shield className="h-5 w-5 text-brand" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-brand font-semibold mb-1">
                                Privacidade
                            </p>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                                Política de Privacidade
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
                        A CrescIX leva sua privacidade a sério. Este documento
                        explica, em português claro, quais dados coletamos, pra
                        que usamos, com quem compartilhamos e quais são seus
                        direitos. Em conformidade com a Lei Geral de Proteção de
                        Dados (LGPD), Lei nº 13.709/2018.
                    </Intro>

                    <Section titulo="1. Quem somos">
                        <p>
                            A CrescIX é uma plataforma de gestão financeira pra
                            pequenos negócios brasileiros. Operamos a partir de
                            Santa Rita do Sapucaí, MG. Nesta política, &quot;nós&quot;,
                            &quot;CrescIX&quot; e &quot;serviço&quot; significam o time e o produto.
                            &quot;Você&quot; é o usuário que cria uma conta no app.
                        </p>
                    </Section>

                    <Section titulo="2. Quais dados coletamos">
                        <p className="mb-3">
                            Coletamos somente o que é necessário pra o serviço
                            funcionar:
                        </p>
                        <Ul>
                            <li>
                                <strong>Cadastro:</strong> nome, e-mail, telefone
                                e uma senha (que armazenamos criptografada,
                                jamais em texto puro).
                            </li>
                            <li>
                                <strong>Negócio:</strong> tipo de comércio,
                                fornecedores, clientes, produtos, pedidos,
                                contas a pagar e receber — informações que você
                                mesmo cadastra ou registra via bot Telegram.
                            </li>
                            <li>
                                <strong>Telegram/WhatsApp (opcional):</strong> se
                                você vincular sua conta a um dos bots, guardamos
                                o identificador de chat correspondente pra
                                ligar as mensagens à sua conta.
                            </li>
                            <li>
                                <strong>Áudios enviados ao bot:</strong>{" "}
                                processados pela OpenAI (Whisper) pra
                                transcrição. O áudio em si não é guardado — só
                                o texto resultante.
                            </li>
                            <li>
                                <strong>Pagamentos:</strong> ao assinar um plano,
                                a Mercado Pago processa a cobrança via PIX ou
                                cartão de crédito. Guardamos apenas:
                                <ul className="mt-2 ml-5 list-[circle] space-y-1 text-white/70">
                                    <li>Status da transação (pago, pendente, falhou)</li>
                                    <li>Identificador do pagamento e da assinatura no Mercado Pago</li>
                                    <li>
                                        No caso de cartão: a bandeira (Visa, Master,
                                        etc.) e os <strong className="text-white">4 últimos dígitos</strong>{" "}
                                        — só pra exibir &quot;Cartão Visa final 1234&quot;
                                        na sua tela
                                    </li>
                                </ul>
                                <p className="mt-2">
                                    <strong className="text-white">A CrescIX nunca tem acesso ao número completo do cartão, à validade ou ao CVV.</strong>{" "}
                                    Esses dados são tokenizados pelo Mercado Pago direto no
                                    seu navegador antes de qualquer envio. Também não
                                    armazenamos chave PIX nem dados de conta bancária.
                                </p>
                            </li>
                            <li>
                                <strong>Logs técnicos:</strong> endereço IP e
                                horário de acesso. Usados pra segurança e
                                detecção de abuso. Retidos por até 90 dias.
                            </li>
                        </Ul>
                        <p className="mt-4">
                            <strong className="text-white">Não coletamos:</strong>{" "}
                            cookies de rastreamento, dados de localização
                            precisa, dados biométricos, ou qualquer informação
                            sensível desnecessária ao serviço.
                        </p>
                    </Section>

                    <Section titulo="3. Pra que usamos seus dados">
                        <Ul>
                            <li>
                                Operar o serviço (autenticação, registros
                                financeiros, relatórios).
                            </li>
                            <li>
                                Comunicação operacional: confirmação de
                                cadastro, recuperação de senha, avisos
                                relacionados à conta.
                            </li>
                            <li>
                                Gerar análises e sugestões pelo recurso
                                &quot;Análise IA&quot; — os dados são processados pela
                                OpenAI, mas não usados pra treinar modelos.
                            </li>
                            <li>
                                Segurança: detectar uso indevido, prevenir
                                fraude, fazer backup pra evitar perda de
                                informação.
                            </li>
                        </Ul>
                        <p className="mt-4">
                            <strong className="text-white">
                                Não fazemos:
                            </strong>{" "}
                            marketing direto, venda de dados, ou
                            compartilhamento com terceiros que não sejam
                            essenciais à operação.
                        </p>
                    </Section>

                    <Section titulo="4. Base legal (LGPD art. 7º)">
                        <p>
                            O tratamento dos seus dados se baseia em:
                        </p>
                        <Ul>
                            <li>
                                <strong>Execução de contrato</strong> (art. 7º, V):
                                pra entregar o serviço que você contratou ao se
                                cadastrar.
                            </li>
                            <li>
                                <strong>Consentimento</strong> (art. 7º, I): você
                                marca explicitamente no cadastro que aceita
                                essa política e os termos de uso.
                            </li>
                            <li>
                                <strong>Legítimo interesse</strong> (art. 7º, IX):
                                pra segurança da plataforma e prevenção de
                                fraudes.
                            </li>
                        </Ul>
                    </Section>

                    <Section titulo="5. Com quem compartilhamos">
                        <p className="mb-3">
                            Apenas com prestadores essenciais à operação,
                            sob contrato com cláusulas de confidencialidade:
                        </p>
                        <Ul>
                            <li>
                                <strong>OpenAI</strong> — transcrição de áudios
                                do bot e geração de análises. Não recebem seus
                                dados de contato, só o conteúdo necessário pra
                                processar o pedido. Conforme política da OpenAI,
                                esses dados não são usados pra treinar modelos.
                            </li>
                            <li>
                                <strong>Mercado Pago</strong> — processamento de
                                pagamentos via PIX e cartão de crédito. Recebem:
                                <ul className="mt-2 ml-5 list-[circle] space-y-1 text-white/70">
                                    <li>Nome, e-mail e CPF/CNPJ do titular</li>
                                    <li>Valor e plano contratado</li>
                                    <li>
                                        Se optar por cartão: número, validade e
                                        CVV — diretamente do seu navegador, sem
                                        passar pela CrescIX
                                    </li>
                                </ul>
                                <p className="mt-2">
                                    Quando você escolhe pagar com cartão e ativar
                                    a renovação automática, o Mercado Pago{" "}
                                    <strong className="text-white">guarda seu cartão tokenizado em sistemas próprios</strong>{" "}
                                    pra poder cobrar nas renovações futuras. Essa
                                    guarda segue a política do Mercado Pago, com
                                    certificação PCI-DSS. Cancelar a assinatura
                                    no nosso app remove a autorização de cobrança.
                                </p>
                            </li>
                            <li>
                                <strong>Resend</strong> — envio de e-mails
                                transacionais (confirmação de cadastro,
                                redefinição de senha, comprovante de pagamento,
                                avisos sobre a assinatura). Recebem apenas o
                                seu nome, e-mail e o conteúdo da mensagem.
                            </li>
                            <li>
                                <strong>Provedores de infraestrutura</strong>{" "}
                                (banco de dados, servidor) — guardam os dados
                                criptografados, sob acordos de proteção.
                            </li>
                            <li>
                                <strong>Telegram / WhatsApp</strong> — quando
                                você opta por usar os bots, essas plataformas
                                processam as mensagens conforme as próprias
                                políticas delas.
                            </li>
                            <li>
                                <strong>Sentry</strong> — quando configurado,
                                recebe relatórios de erro técnico do app
                                (mensagem do erro, stack trace, rota acessada)
                                pra que a gente consiga corrigir bugs. Não
                                enviamos dados financeiros nem conteúdo dos
                                seus registros — apenas metadados de execução.
                            </li>
                        </Ul>
                        <p className="mt-4">
                            Não vendemos, alugamos ou trocamos seus dados com
                            ninguém. Em caso de exigência judicial, atendemos
                            apenas dentro dos limites da ordem.
                        </p>
                    </Section>

                    <Section titulo="6. Seus direitos (LGPD art. 18)">
                        <p className="mb-3">
                            Você pode, a qualquer momento, exercer os seguintes
                            direitos:
                        </p>
                        <Ul>
                            <li>
                                <strong>Acessar</strong> os dados que temos sobre
                                você.
                            </li>
                            <li>
                                <strong>Corrigir</strong> dados incorretos ou
                                desatualizados (você mesmo edita no app).
                            </li>
                            <li>
                                <strong>Excluir</strong> sua conta e os dados
                                associados — basta enviar um e-mail pro nosso
                                Encarregado.
                            </li>
                            <li>
                                <strong>Exportar</strong> seus dados num
                                formato estruturado (CSV/JSON).
                            </li>
                            <li>
                                <strong>Revogar consentimento</strong> a
                                qualquer momento — isso encerra sua conta.
                            </li>
                            <li>
                                <strong>Reclamar</strong> à Autoridade Nacional
                                de Proteção de Dados (ANPD) caso ache que
                                violamos seus direitos.
                            </li>
                        </Ul>
                    </Section>

                    <Section titulo="7. Segurança">
                        <Ul>
                            <li>Senhas armazenadas com hash bcrypt.</li>
                            <li>Comunicação via HTTPS.</li>
                            <li>
                                Autenticação por token JWT com expiração e
                                rotação.
                            </li>
                            <li>
                                Limitação de tentativas de login pra prevenir
                                ataques de força bruta.
                            </li>
                            <li>
                                Dados isolados por usuário (multi-tenancy) —
                                ninguém vê os dados de ninguém.
                            </li>
                        </Ul>
                    </Section>

                    <Section titulo="8. Cookies e armazenamento local">
                        <p>
                            Não usamos cookies de rastreamento, analytics ou
                            anúncios. Guardamos no <em>localStorage</em> do seu
                            navegador apenas o token JWT que mantém você logado
                            (essencial pra o serviço funcionar) e algumas
                            preferências de interface (ex.: se você dispensou
                            o card de boas-vindas no dashboard).
                        </p>
                    </Section>

                    <Section titulo="9. Retenção">
                        <Ul>
                            <li>
                                <strong>Conta ativa:</strong> mantemos os dados
                                enquanto sua conta existir.
                            </li>
                            <li>
                                <strong>Após exclusão:</strong> apagamos seus
                                dados em até 30 dias, exceto quando há
                                obrigação legal de retenção.
                            </li>
                            <li>
                                <strong>Registros de pagamento:</strong> mantidos
                                por 5 anos após a transação, conforme exigência
                                fiscal e o Código Civil (art. 206, § 5º, I) pra
                                eventual prestação de contas. São anonimizados
                                sempre que possível.
                            </li>
                            <li>
                                <strong>Logs técnicos:</strong> até 90 dias.
                            </li>
                            <li>
                                <strong>Relatórios de erro (Sentry):</strong>{" "}
                                retidos conforme política do provedor (geralmente
                                30 a 90 dias) e usados só pra diagnóstico.
                            </li>
                        </Ul>
                    </Section>

                    <Section titulo="10. Contato do Encarregado (DPO)">
                        <p>
                            Pra exercer seus direitos ou tirar dúvidas sobre
                            esta política, fale com nosso Encarregado pelo
                            Tratamento de Dados Pessoais:
                        </p>
                        <p className="mt-3 font-mono text-brand">
                            privacidade@crescix.com.br
                        </p>
                    </Section>

                    <Section titulo="11. Atualizações">
                        <p>
                            Esta política pode ser atualizada pra refletir
                            mudanças no serviço ou na legislação. Quando isso
                            acontecer, vamos te avisar por e-mail e na própria
                            interface antes da nova versão entrar em vigor.
                        </p>
                    </Section>

                    <footer className="pt-8 border-t border-white/10 text-sm text-white/45">
                        Dúvidas? Manda um e-mail pra{" "}
                        <a
                            href="mailto:privacidade@crescix.com.br"
                            className="text-brand hover:text-brand-strong"
                        >
                            privacidade@crescix.com.br
                        </a>
                        . Respondemos em até 5 dias úteis.
                    </footer>
                </article>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVAS DE PROSE
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
