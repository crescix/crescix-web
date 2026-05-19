"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus, Search, Building2, Pencil, Trash2,
  ChevronDown, ChevronUp, X, Loader2, AlertCircle,
} from "lucide-react";
import axios from "axios";
import {
  Fornecedor,
  FORNECEDOR_TYPE_LABEL,
} from "@/lib/data/fornecedores";
import {
  listFornecedores,
  deleteFornecedor,
} from "@/services/fornecedores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function FornecedoresPage() {
  const [busca, setBusca] = useState("");
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});
  const [fornecedorParaExcluir, setFornecedorParaExcluir] =
    useState<Fornecedor | null>(null);
  const [lista, setLista] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Fetch (com debounce na busca) ────────────────────────────────────────
  const fetchFornecedores = useCallback(async (search?: string) => {
    setError(null);
    try {
      const result = await listFornecedores({
        limit: 100,
        ...(search && search.trim() && { search: search.trim() }),
      });
      setLista(result.data);
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Não consegui carregar a lista agora.";
      setError(message);
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    setLoading(true);
    fetchFornecedores().finally(() => setLoading(false));
  }, [fetchFornecedores]);

  // Busca com debounce (300ms)
  useEffect(() => {
    if (loading) return; // não dispara enquanto a carga inicial não acaba
    const handle = setTimeout(() => {
      fetchFornecedores(busca);
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca]);

  // ─── Agrupamento por tipo (client-side) ──────────────────────────────────
  const grouped = useMemo(() => {
    return lista.reduce((acc, curr) => {
      if (!acc[curr.type]) acc[curr.type] = [];
      acc[curr.type].push(curr);
      return acc;
    }, {} as Record<string, Fornecedor[]>);
  }, [lista]);

  const tipos = Object.keys(grouped);

  const toggleGrupo = (tipo: string) =>
    setExpandidos((prev) => ({ ...prev, [tipo]: !prev[tipo] }));

  const isExpanded = (tipo: string) => expandidos[tipo] !== false;

  // ─── Exclusão ─────────────────────────────────────────────────────────────
  const handleConfirmarExclusao = async () => {
    if (!fornecedorParaExcluir) return;
    setIsDeleting(true);
    try {
      await deleteFornecedor(fornecedorParaExcluir.id);
      setLista((prev) =>
        prev.filter((f) => f.id !== fornecedorParaExcluir.id)
      );
      setFornecedorParaExcluir(null);
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Não consegui excluir agora. Tente novamente.";
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <ConfirmDialog
        open={!!fornecedorParaExcluir}
        onOpenChange={(open) => !open && setFornecedorParaExcluir(null)}
        onConfirm={handleConfirmarExclusao}
        isConfirming={isDeleting}
        title="Excluir fornecedor?"
        description="Vai sumir da lista e dos relatórios. Tem certeza?"
        preview={
          fornecedorParaExcluir
            ? [
                { label: "Nome", value: fornecedorParaExcluir.razaoSocial },
                {
                  label: "CNPJ",
                  value: (
                    <span className="font-mono text-white/80">
                      {fornecedorParaExcluir.cnpj}
                    </span>
                  ),
                },
                { label: "Endereço", value: fornecedorParaExcluir.endereco },
              ]
            : undefined
        }
      />

      <div className="w-full min-h-screen bg-secondary p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-6xl space-y-6">

          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Fornecedores
              </h1>
              <p className="text-sm text-white/45 mt-1">
                {loading
                  ? "Carregando..."
                  : lista.length === 0
                    ? "Quem te abastece, num só lugar."
                    : `${lista.length} ${lista.length === 1 ? "cadastrado" : "cadastrados"}`}
              </p>
            </div>
            <Link href="/fornecedores/cadastro">
              <Button className="bg-brand hover:bg-brand-strong text-white font-semibold rounded-lg px-5 glow-brand glow-brand-hover transition-base">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </Link>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex flex-wrap items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-red-400 text-sm font-medium">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    fetchFornecedores(busca).finally(() => setLoading(false));
                  }}
                  className="text-xs text-red-300 hover:underline mt-1"
                >
                  Tentar novamente
                </button>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400/60 hover:text-red-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              type="text"
              placeholder="Buscar por razão social ou CNPJ..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 bg-primary border-white/10 text-white placeholder:text-white/30 focus:border-green-500/50 h-11 text-sm"
            />
          </div>

          {/* Loading */}
          {loading && (
            <div className="bg-primary rounded-2xl border border-white/10 p-16 text-center">
              <Loader2 className="w-8 h-8 text-green-400 mx-auto mb-3 animate-spin" />
              <p className="text-sm text-white/40">Carregando fornecedores...</p>
            </div>
          )}

          {/* Lista agrupada */}
          {!loading && tipos.length === 0 && !error && (
            <div className="bg-primary rounded-2xl border border-white/10 p-12 md:p-16 text-center">
              <Building2 className="w-10 h-10 text-white/15 mx-auto mb-3" />
              {busca ? (
                <p className="text-sm text-white/40">
                  Nada encontrado pra <span className="text-white/60">&quot;{busca}&quot;</span>.
                </p>
              ) : (
                <>
                  <h3 className="text-base font-semibold text-white">
                    Nenhum fornecedor por aqui ainda
                  </h3>
                  <p className="text-sm text-white/45 mt-1.5 max-w-sm mx-auto">
                    Cadastre quem te abastece pra usar nos pedidos de compra e relatórios.
                  </p>
                  <Link href="/fornecedores/cadastro" className="inline-block mt-5">
                    <Button className="bg-brand hover:bg-brand-strong text-white font-semibold">
                      <Plus className="mr-2 h-4 w-4" />
                      Cadastrar o primeiro
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}

          {!loading && tipos.length > 0 && (
            <div className="space-y-4">
              {tipos.map((tipo) => (
                <div
                  key={tipo}
                  className="bg-primary rounded-2xl border border-white/10 overflow-hidden"
                >
                  <button
                    onClick={() => toggleGrupo(tipo)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500/10 rounded-lg p-2">
                        <Building2 className="w-4 h-4 text-green-400" />
                      </div>
                      <span className="font-bold text-white text-sm uppercase tracking-wide">
                        {FORNECEDOR_TYPE_LABEL[tipo as keyof typeof FORNECEDOR_TYPE_LABEL] ?? tipo}
                      </span>
                      <span className="bg-green-500/15 text-green-400 text-xs font-semibold px-2 py-0.5 rounded-full border border-green-500/20">
                        {grouped[tipo].length}
                      </span>
                    </div>
                    {isExpanded(tipo)
                      ? <ChevronUp className="w-4 h-4 text-white/40 group-hover:text-white/70" />
                      : <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-white/70" />
                    }
                  </button>

                  {isExpanded(tipo) && (
                    <div className="border-t border-white/10 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-white/5 border-b border-white/10">
                            <th className="text-left px-6 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider w-[35%]">Razão Social</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">CNPJ</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Endereço</th>
                            <th className="text-right px-6 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {grouped[tipo].map((f) => (
                            <tr
                              key={f.id}
                              className="border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors"
                            >
                              <td className="px-6 py-4 font-medium text-white">{f.razaoSocial}</td>
                              <td className="px-6 py-4 text-white/70 font-mono text-xs">{f.cnpj}</td>
                              <td className="px-6 py-4 text-white/70">{f.endereco}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-1">
                                  <Link
                                    href={`/fornecedores/editar/${f.id}`}
                                    title="Editar" aria-label="Editar"
                                    className="p-2 rounded-lg text-white/40 hover:text-green-400 hover:bg-green-500/10 transition-colors"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Link>
                                  <button
                                    onClick={() => setFornecedorParaExcluir(f)}
                                    title="Excluir" aria-label="Excluir"
                                    className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
