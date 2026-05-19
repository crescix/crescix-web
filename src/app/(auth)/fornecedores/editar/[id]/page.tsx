"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Building2, ChevronLeft, Loader2 } from "lucide-react";
import {
  getFornecedor,
  updateFornecedor,
  type Fornecedor,
} from "@/services/fornecedores";
import { maskCNPJ, maskPhone, normalizeUrl } from "@/lib/utils/masks";
import { extractApiError } from "@/lib/utils/api-errors";
import { useToast } from "@/components/ui/toast";
import { FornecedorForm } from "../../_components/fornecedor-form";
import type { FornecedorFormData } from "@/lib/validations/fornecedor/cadastro";

export default function EditarFornecedor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Carrega o fornecedor da API ────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    getFornecedor(id)
      .then((data) => {
        if (!cancelled) setFornecedor(data);
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          axios.isAxiosError(err) && err.response?.status === 404
            ? "Fornecedor não encontrado."
            : "Não consegui carregar o fornecedor agora.";
        setLoadError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-secondary flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-white/60">
          <Loader2 className="w-5 h-5 animate-spin text-brand" />
          <span className="text-sm">Carregando fornecedor...</span>
        </div>
      </div>
    );
  }

  // ── Erro / não encontrado ──────────────────────────────────────────────
  if (loadError || !fornecedor) {
    return (
      <div className="w-full min-h-screen bg-secondary flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="bg-red-500/10 rounded-2xl p-6 inline-block">
            <Building2 className="w-8 h-8 text-red-400 mx-auto" />
          </div>
          <p className="text-white/80 font-medium">
            {loadError ?? "Fornecedor não encontrado."}
          </p>
          <Link
            href="/fornecedores"
            className="inline-flex items-center gap-2 text-brand hover:text-brand-strong text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar pra fornecedores
          </Link>
        </div>
      </div>
    );
  }

  // ── Submit ─────────────────────────────────────────────────────────────
  // Opcionais saem como string (vazia ou preenchida) — o backend (Prisma)
  // aceita ambos. Tecnicamente `null` seria mais limpo pra "limpar" campos,
  // mas isso exigiria estender o type FornecedorUpdate. String vazia
  // funciona pro caso comum e mantém retrocompatibilidade.
  const handleSubmit = async (data: FornecedorFormData) => {
    setSubmitError(null);
    try {
      await updateFornecedor(id, {
        razaoSocial: data.razaoSocial,
        cnpj: data.cnpj,
        endereco: data.endereco,
        type: data.type,
        bairro: data.bairro || undefined,
        numero: data.numero || undefined,
        ramoAtividade: data.ramoAtividade || undefined,
        nomeVendedor: data.nomeVendedor || undefined,
        whatsappVendedor: data.whatsappVendedor || undefined,
        emailVendedor: data.emailVendedor || undefined,
        siteCatalogo: data.siteCatalogo ? normalizeUrl(data.siteCatalogo) : undefined,
        chavePix: data.chavePix || undefined,
        banco: data.banco || undefined,
        agencia: data.agencia || undefined,
        conta: data.conta || undefined,
        condicaoPagamento: data.condicaoPagamento || undefined,
      });
      toast.success("Alterações salvas.");
      router.push("/fornecedores");
    } catch (err) {
      setSubmitError(extractApiError(err, "Não consegui salvar as alterações."));
      throw err;
    }
  };

  // ── Preenche os defaults pro form compartilhado ───────────────────────
  const defaults: Partial<FornecedorFormData> = {
    razaoSocial: fornecedor.razaoSocial,
    cnpj: maskCNPJ(fornecedor.cnpj),
    endereco: fornecedor.endereco,
    type: fornecedor.type,
    bairro: fornecedor.bairro ?? "",
    numero: fornecedor.numero ?? "",
    ramoAtividade: fornecedor.ramoAtividade ?? "",
    nomeVendedor: fornecedor.nomeVendedor ?? "",
    whatsappVendedor: fornecedor.whatsappVendedor
      ? maskPhone(fornecedor.whatsappVendedor)
      : "",
    emailVendedor: fornecedor.emailVendedor ?? "",
    siteCatalogo: fornecedor.siteCatalogo ?? "",
    chavePix: fornecedor.chavePix ?? "",
    banco: fornecedor.banco ?? "",
    agencia: fornecedor.agencia ?? "",
    conta: fornecedor.conta ?? "",
    condicaoPagamento: fornecedor.condicaoPagamento ?? "",
  };

  return (
    <FornecedorForm
      titulo="Editar fornecedor"
      subtitulo={fornecedor.razaoSocial}
      defaultValues={defaults}
      submitLabel="Salvar alterações"
      submittingLabel="Salvando..."
      onSubmit={handleSubmit}
      submitError={submitError}
      onClearSubmitError={() => setSubmitError(null)}
    />
  );
}
