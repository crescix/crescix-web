"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus, Search, Building2, Pencil, Trash2,
  ChevronDown, ChevronUp, AlertTriangle, X,
} from "lucide-react";
import { fornecedoresData, Fornecedor } from "@/lib/data/fornecedores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─────────────────────────────────────────────────────────────────────────────
// MODAL DE EXCLUSÃO
// ─────────────────────────────────────────────────────────────────────────────
function ModalExclusao({
  fornecedor,
  onConfirm,
  onCancel,
}: {
  fornecedor: Fornecedor;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-primary border border-white/10 text-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/10 rounded-xl p-2.5">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Confirmar Exclusão</h2>
              <p className="text-xs text-white/40 mt-0.5">Esta ação não poderá ser desfeita</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dados */}
        <div className="p-6 space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3 text-sm">
            <div className="grid grid-cols-[110px_1fr] gap-3">
              <span className="text-xs text-white/50 font-bold uppercase">Razão Social</span>
              <span className="text-white font-medium">{fornecedor.razaoSocial}</span>
            </div>
            <div className="grid grid-cols-[110px_1fr] gap-3">
              <span className="text-xs text-white/50 font-bold uppercase">CNPJ</span>
              <span className="text-white/80 font-mono">{fornecedor.cnpj}</span>
            </div>
            <div className="grid grid-cols-[110px_1fr] gap-3">
              <span className="text-xs text-white/50 font-bold uppercase">Endereço</span>
              <span className="text-white/80">{fornecedor.endereco}</span>
            </div>
          </div>

          <p className="text-sm text-white/60">
            Tem certeza que deseja excluir{" "}
            <strong className="text-white">{fornecedor.razaoSocial}</strong>?
          </p>
        </div>

        {/* Botões */}
        <div className="border-t border-white/10 bg-white/5 px-6 py-5 flex gap-3 justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="border border-white/10 text-white hover:bg-white/10"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Sim, Excluir
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function FornecedoresPage() {
  const [busca, setBusca] = useState("");
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});
  const [fornecedorParaExcluir, setFornecedorParaExcluir] = useState<Fornecedor | null>(null);
  const [lista, setLista] = useState<Fornecedor[]>(fornecedoresData);

  const grouped = useMemo(() => {
    const filtrado = lista.filter(
      (f) =>
        f.razaoSocial.toLowerCase().includes(busca.toLowerCase()) ||
        f.cnpj.includes(busca)
    );
    return filtrado.reduce((acc, curr) => {
      if (!acc[curr.type]) acc[curr.type] = [];
      acc[curr.type].push(curr);
      return acc;
    }, {} as Record<string, Fornecedor[]>);
  }, [lista, busca]);

  const tipos = Object.keys(grouped);

  const toggleGrupo = (tipo: string) =>
    setExpandidos((prev) => ({ ...prev, [tipo]: !prev[tipo] }));

  const isExpanded = (tipo: string) => expandidos[tipo] !== false;

  const handleConfirmarExclusao = () => {
    if (!fornecedorParaExcluir) return;
    setLista((prev) => prev.filter((f) => f.id !== fornecedorParaExcluir.id));
    setFornecedorParaExcluir(null);
  };

  return (
    <>
      {fornecedorParaExcluir && (
        <ModalExclusao
          fornecedor={fornecedorParaExcluir}
          onConfirm={handleConfirmarExclusao}
          onCancel={() => setFornecedorParaExcluir(null)}
        />
      )}

      <div className="w-full min-h-screen bg-secondary p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-6xl space-y-6">

          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">
                Cadastros
              </p>
              <h1 className="text-3xl font-black text-white tracking-tighter">
                Fornecedores
              </h1>
              <p className="text-sm text-white/40 mt-1">
                {lista.length} {lista.length === 1 ? "parceiro cadastrado" : "parceiros cadastrados"}
              </p>
            </div>
            <Link href="/fornecedores/cadastro">
              <Button className="bg-green-500 hover:bg-green-400 text-white font-bold rounded-full px-5 transition-all hover:scale-105 active:scale-95">
                <Plus className="mr-2 h-4 w-4" />
                Novo Fornecedor
              </Button>
            </Link>
          </div>

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

          {/* Lista agrupada */}
          {tipos.length === 0 ? (
            <div className="bg-primary rounded-2xl border border-white/10 p-16 text-center">
              <Building2 className="w-10 h-10 text-white/15 mx-auto mb-3" />
              <p className="text-sm text-white/40">Nenhum fornecedor encontrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tipos.map((tipo) => (
                <div
                  key={tipo}
                  className="bg-primary rounded-2xl border border-white/10 overflow-hidden"
                >
                  {/* Header do grupo */}
                  <button
                    onClick={() => toggleGrupo(tipo)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500/10 rounded-lg p-2">
                        <Building2 className="w-4 h-4 text-green-400" />
                      </div>
                      <span className="font-bold text-white text-sm uppercase tracking-wide">
                        {tipo}
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

                  {/* Tabela */}
                  {isExpanded(tipo) && (
                    <div className="border-t border-white/10 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-white/5 border-b border-white/10">
                            <th className="text-left px-6 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider w-[35%]">
                              Razão Social
                            </th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">
                              CNPJ
                            </th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">
                              Endereço
                            </th>
                            <th className="text-right px-6 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {grouped[tipo].map((f) => (
                            <tr
                              key={f.id}
                              className="border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors"
                            >
                              <td className="px-6 py-4 font-medium text-white">
                                {f.razaoSocial}
                              </td>
                              <td className="px-6 py-4 text-white/70 font-mono text-xs">
                                {f.cnpj}
                              </td>
                              <td className="px-6 py-4 text-white/70">
                                {f.endereco}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-1">
                                  <Link
                                    href={`/fornecedores/editar/${f.id}`}
                                    title="Editar"
                                    className="p-2 rounded-lg text-white/40 hover:text-green-400 hover:bg-green-500/10 transition-colors"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Link>
                                  <button
                                    onClick={() => setFornecedorParaExcluir(f)}
                                    title="Excluir"
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
