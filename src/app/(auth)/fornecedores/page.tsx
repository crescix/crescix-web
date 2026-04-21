"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Building2,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  X,
} from "lucide-react";
import { fornecedoresData, Fornecedor } from "@/lib/data/fornecedores";

// ─────────────────────────────────────────────────────────────────────────────
// MODAL DE EXCLUSÃO (inline — sem dependência de componente externo)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">

        {/* Fechar */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ícone de alerta */}
        <div className="flex items-center gap-3">
          <div className="bg-rose-100 rounded-xl p-3 flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800">
              Confirmar Exclusão
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Esta ação não poderá ser desfeita
            </p>
          </div>
        </div>

        {/* Dados do fornecedor */}
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex gap-2">
            <span className="text-gray-400 min-w-[80px]">Razão Social:</span>
            <span className="font-medium text-gray-700">{fornecedor.razaoSocial}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400 min-w-[80px]">CNPJ:</span>
            <span className="font-medium text-gray-700">{fornecedor.cnpj}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400 min-w-[80px]">Endereço:</span>
            <span className="font-medium text-gray-700">{fornecedor.endereco}</span>
          </div>
        </div>

        <p className="text-sm text-gray-500">
          Tem certeza que deseja excluir o fornecedor{" "}
          <strong className="text-gray-700">{fornecedor.razaoSocial}</strong>?
        </p>

        {/* Botões */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Sim, Excluir
          </button>
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

  // Agrupa por tipo
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

  const isExpanded = (tipo: string) => expandidos[tipo] !== false; // aberto por padrão

  const handleConfirmarExclusao = () => {
    if (!fornecedorParaExcluir) return;
    setLista((prev) => prev.filter((f) => f.id !== fornecedorParaExcluir.id));
    setFornecedorParaExcluir(null);
  };

  return (
    <>
      {/* Modal de exclusão */}
      {fornecedorParaExcluir && (
        <ModalExclusao
          fornecedor={fornecedorParaExcluir}
          onConfirm={handleConfirmarExclusao}
          onCancel={() => setFornecedorParaExcluir(null)}
        />
      )}

      <div className="min-h-screen w-full bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">

          {/* Cabeçalho */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                Fornecedores
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {lista.length} parceiros cadastrados
              </p>
            </div>
            <Link href="/fornecedores/cadastro">
              <button className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm">
                <Plus className="w-4 h-4" />
                Novo Fornecedor
              </button>
            </Link>
          </div>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por razão social ou CNPJ..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          {/* Lista agrupada */}
          {tipos.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Nenhum fornecedor encontrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tipos.map((tipo) => (
                <div
                  key={tipo}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* Header do grupo */}
                  <button
                    onClick={() => toggleGrupo(tipo)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-teal-50 rounded-lg p-1.5">
                        <Building2 className="w-4 h-4 text-teal-600" />
                      </div>
                      <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                        {tipo}
                      </span>
                      <span className="bg-teal-50 text-teal-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        {grouped[tipo].length}
                      </span>
                    </div>
                    {isExpanded(tipo)
                      ? <ChevronUp className="w-4 h-4 text-gray-400" />
                      : <ChevronDown className="w-4 h-4 text-gray-400" />
                    }
                  </button>

                  {/* Tabela */}
                  {isExpanded(tipo) && (
                    <div className="border-t border-gray-100">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-50">
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[35%]">
                              Razão Social
                            </th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                              CNPJ
                            </th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                              Endereço
                            </th>
                            <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {grouped[tipo].map((f) => (
                            <tr
                              key={f.id}
                              className="hover:bg-gray-50/60 transition-colors"
                            >
                              <td className="px-6 py-4 font-medium text-gray-700">
                                {f.razaoSocial}
                              </td>
                              <td className="px-6 py-4 text-gray-500">
                                {f.cnpj}
                              </td>
                              <td className="px-6 py-4 text-gray-500">
                                {f.endereco}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-2">
                                  <Link
                                    href={`/fornecedores/editar/${f.id}`}
                                    className="p-2 rounded-lg text-teal-600 hover:bg-teal-50 transition-colors"
                                    title="Editar"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Link>
                                  <button
                                    onClick={() => setFornecedorParaExcluir(f)}
                                    className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                                    title="Excluir"
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
