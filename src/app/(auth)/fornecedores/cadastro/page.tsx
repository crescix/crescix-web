"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { createFornecedor } from "@/services/fornecedores";
import { extractApiError } from "@/lib/utils/api-errors";
import { normalizeUrl } from "@/lib/utils/masks";
import { useToast } from "@/components/ui/toast";
import { FornecedorForm } from "../_components/fornecedor-form";
import type { FornecedorFormData } from "@/lib/validations/fornecedor/cadastro";

export default function CadastroFornecedor() {
    const router = useRouter();
    const toast = useToast();
    const [sucesso, setSucesso] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleSubmit = async (data: FornecedorFormData) => {
        setSubmitError(null);
        try {
            await createFornecedor({
                razaoSocial: data.razaoSocial,
                cnpj: data.cnpj,
                endereco: data.endereco,
                type: data.type,
                // Opcionais: só envia se preenchido. Evita salvar "" no banco.
                ...(data.bairro && { bairro: data.bairro }),
                ...(data.numero && { numero: data.numero }),
                ...(data.ramoAtividade && { ramoAtividade: data.ramoAtividade }),
                ...(data.nomeVendedor && { nomeVendedor: data.nomeVendedor }),
                ...(data.whatsappVendedor && { whatsappVendedor: data.whatsappVendedor }),
                ...(data.emailVendedor && { emailVendedor: data.emailVendedor }),
                ...(data.siteCatalogo && { siteCatalogo: normalizeUrl(data.siteCatalogo) }),
                ...(data.chavePix && { chavePix: data.chavePix }),
                ...(data.banco && { banco: data.banco }),
                ...(data.agencia && { agencia: data.agencia }),
                ...(data.conta && { conta: data.conta }),
                ...(data.condicaoPagamento && { condicaoPagamento: data.condicaoPagamento }),
            });
            setSucesso(true);
        } catch (err) {
            setSubmitError(extractApiError(err, "Não consegui cadastrar agora. Tente novamente."));
            // Re-lança pra useForm marcar isSubmitting=false
            throw err;
        }
    };

    return (
        <>
            <FornecedorForm
                titulo="Novo fornecedor"
                subtitulo="Cadastre quem te abastece. Só o básico é obrigatório."
                submitLabel="Cadastrar"
                submittingLabel="Cadastrando..."
                onSubmit={handleSubmit}
                submitError={submitError}
                onClearSubmitError={() => setSubmitError(null)}
            />

            {/* Modal de sucesso */}
            {sucesso && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
                    <div className="bg-primary w-full max-w-sm rounded-2xl border border-white/10 p-6 space-y-4 text-center">
                        <div className="flex justify-center">
                            <div className="w-12 h-12 rounded-full bg-brand/15 flex items-center justify-center">
                                <CheckCircle2 className="h-6 w-6 text-brand" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-lg">Pronto!</h2>
                            <p className="text-sm text-white/55 mt-1">
                                Fornecedor cadastrado com sucesso.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => {
                                    setSucesso(false);
                                    router.push("/fornecedores");
                                }}
                                className="w-full h-10 rounded-lg bg-brand hover:bg-brand-strong text-white text-sm font-semibold transition-colors"
                            >
                                Ver lista
                            </button>
                            <button
                                onClick={() => {
                                    setSucesso(false);
                                    // Reset suave: navega pra própria URL pra remontar o form
                                    router.refresh();
                                    toast.success("Pronto, agora outro?");
                                }}
                                className="w-full h-10 rounded-lg border border-white/10 text-white/70 text-sm font-medium hover:bg-white/5 transition-colors"
                            >
                                Cadastrar outro
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
