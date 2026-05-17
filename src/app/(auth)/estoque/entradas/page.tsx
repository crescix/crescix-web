"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  X,
  Trash2,
  AlertCircle,
  PackageCheck,
  Plus,
  ChevronLeft,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  MovimentoEstoque,
  MOTIVO_MOVIMENTO_LABEL,
  MOTIVO_ENTRADA_OPTIONS,
  MOTIVO_MOVIMENTO_STYLES,
  formatBRL,
  formatDateBR,
} from "@/lib/data/estoque";
import type { MotivoMovimento } from "@/services/api/enums";
import {
  listMovimentos,
  createMovimento,
  deleteMovimento,
} from "@/services/movimentos-estoque";
import { listProdutos, type Produto } from "@/services/produtos";
import { listFornecedores, type Fornecedor } from "@/services/fornecedores";
import { extractApiError } from "@/lib/utils/api-errors";

const inputClass =
  "w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-green-500/50 text-sm transition-colors";
const selectClass =
  "w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-green-500/50 text-sm transition-colors cursor-pointer";

function Field({
  label,
  required,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-white/50 text-xs font-semibold uppercase tracking-wide">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

type FormState = {
  produtoId: string;
  fornecedorId: string;
  motivo: MotivoMovimento;
  quantidade: string;
  custoUnitario: string;
  observacoes: string;
};

const FORM_VAZIO: FormState = {
  produtoId: "",
  fornecedorId: "",
  motivo: "COMPRA",
  quantidade: "",
  custoUnitario: "",
  observacoes: "",
};

export default function EntradasEstoque() {
  const router = useRouter();

  const [entradas, setEntradas] = useState<MovimentoEstoque[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(FORM_VAZIO);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [filtros, setFiltros] = useState({
    produtoId: "",
    motivo: "" as "" | MotivoMovimento,
    dataInicio: "",
    dataFim: "",
  });

  const [modalForm, setModalForm] = useState(false);
  const [modalExcluir, setModalExcluir] = useState<MovimentoEstoque | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sucesso, setSucesso] = useState<string | null>(null);

  useEffect(() => {
    if (!sucesso) return;
    const t = setTimeout(() => setSucesso(null), 2000);
    return () => clearTimeout(t);
  }, [sucesso]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [movRes, prodRes, fornRes] = await Promise.all([
        listMovimentos({
          limit: 200,
          tipo: "ENTRADA",
          ...(filtros.produtoId && { produtoId: filtros.produtoId }),
          ...(filtros.motivo && { motivo: filtros.motivo }),
          ...(filtros.dataInicio && { dataFrom: filtros.dataInicio }),
          ...(filtros.dataFim && { dataTo: filtros.dataFim }),
        }),
        listProdutos({ limit: 200 }),
        listFornecedores({ limit: 200 }),
      ]);
      setEntradas(movRes.data);
      setProdutos(prodRes.data);
      setFornecedores(fornRes.data);
    } catch (err) {
      setLoadError(extractApiError(err, "Erro ao carregar entradas."));
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function validar(): boolean {
    const erros: Partial<Record<keyof FormState, string>> = {};
    if (!form.produtoId) erros.produtoId = "Obrigatório";
    if (!form.quantidade || Number(form.quantidade) <= 0)
      erros.quantidade = "Quantidade > 0";
    setFormErrors(erros);
    return Object.keys(erros).length === 0;
  }

  async function handleSalvar() {
    if (!validar()) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      await createMovimento({
        produtoId: form.produtoId,
        fornecedorId: form.fornecedorId || undefined,
        tipo: "ENTRADA",
        motivo: form.motivo,
        quantidade: Number(form.quantidade),
        custoUnitario: form.custoUnitario
          ? Number(form.custoUnitario.replace(",", "."))
          : undefined,
        observacoes: form.observacoes.trim() || undefined,
      });
      setModalForm(false);
      setForm(FORM_VAZIO);
      setFormErrors({});
      setSucesso("Entrada registrada com sucesso!");
      fetchData();
    } catch (err) {
      setSubmitError(extractApiError(err, "Erro ao registrar entrada."));
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmarExclusao() {
    if (!modalExcluir) return;
    setIsDeleting(true);
    try {
      await deleteMovimento(modalExcluir.id);
      setModalExcluir(null);
      setSucesso("Entrada excluída com sucesso!");
      fetchData();
    } catch (err) {
      setLoadError(extractApiError(err, "Erro ao excluir entrada."));
    } finally {
      setIsDeleting(false);
    }
  }

  function limparFiltros() {
    setFiltros({ produtoId: "", motivo: "", dataInicio: "", dataFim: "" });
  }

  const hasFiltros =
    filtros.produtoId || filtros.motivo || filtros.dataInicio || filtros.dataFim;
  const totalQuantidade = entradas.reduce((acc, e) => acc + e.quantidade, 0);

  return (
    <div className="w-full min-h-screen bg-secondary p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl text-white/50 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-1">
                Estoque
              </p>
              <h1 className="text-3xl font-black text-white tracking-tighter">
                Entradas
              </h1>
            </div>
          </div>
          <button
            onClick={() => {
              setForm(FORM_VAZIO);
              setFormErrors({});
              setSubmitError(null);
              setModalForm(true);
            }}
            className="flex items-center gap-2 px-5 h-10 rounded-xl bg-green-500 hover:bg-green-400 text-white text-sm font-bold transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" /> Nova Entrada
          </button>
        </div>

        {/* Erro de load */}
        {loadError && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="flex-1 text-red-400 text-sm font-medium">{loadError}</p>
            <button
              onClick={fetchData}
              className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-1"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Tentar novamente
            </button>
            <button
              onClick={() => setLoadError(null)}
              className="text-red-400/60 hover:text-red-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-primary rounded-2xl border border-white/10 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
              <Search className="h-3 w-3" />
            </span>
            <h2 className="text-base font-bold text-white">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Produto">
              <select
                value={filtros.produtoId}
                onChange={(e) =>
                  setFiltros({ ...filtros, produtoId: e.target.value })
                }
                className={selectClass}
              >
                <option value="" className="bg-[#0f2f52]">
                  Todos
                </option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#0f2f52]">
                    {p.nome}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Motivo">
              <select
                value={filtros.motivo}
                onChange={(e) =>
                  setFiltros({
                    ...filtros,
                    motivo: e.target.value as "" | MotivoMovimento,
                  })
                }
                className={selectClass}
              >
                <option value="" className="bg-[#0f2f52]">
                  Todos
                </option>
                {MOTIVO_ENTRADA_OPTIONS.map((m) => (
                  <option key={m} value={m} className="bg-[#0f2f52]">
                    {MOTIVO_MOVIMENTO_LABEL[m]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Data início">
              <input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) =>
                  setFiltros({ ...filtros, dataInicio: e.target.value })
                }
                className={inputClass}
              />
            </Field>

            <Field label="Data fim">
              <input
                type="date"
                value={filtros.dataFim}
                onChange={(e) =>
                  setFiltros({ ...filtros, dataFim: e.target.value })
                }
                className={inputClass}
              />
            </Field>
          </div>

          {hasFiltros && (
            <div className="flex justify-end">
              <button
                onClick={limparFiltros}
                className="flex items-center gap-2 px-5 h-10 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 text-sm font-semibold transition-all active:scale-95"
              >
                <X className="h-4 w-4" /> Limpar filtros
              </button>
            </div>
          )}
        </div>

        {/* Lista */}
        <div className="bg-primary rounded-2xl border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                <PackageCheck className="h-3 w-3" />
              </span>
              <h2 className="text-base font-bold text-white">Entradas registradas</h2>
            </div>
            <div className="flex items-center gap-4">
              {entradas.length > 0 && (
                <span className="text-white/40 text-xs">
                  Total:{" "}
                  <span className="text-white font-semibold">
                    {totalQuantidade} unidades
                  </span>
                </span>
              )}
              <span className="text-white/40 text-xs">
                {entradas.length}{" "}
                {entradas.length === 1 ? "entrada" : "entradas"}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="py-16 flex items-center justify-center gap-2 text-white/60">
              <Loader2 className="h-4 w-4 animate-spin text-green-400" />
              <span className="text-sm">Carregando...</span>
            </div>
          ) : entradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <PackageCheck className="h-8 w-8 text-white/15" />
              <p className="text-white/30 text-sm">
                {hasFiltros
                  ? "Nenhuma entrada encontrada com esses filtros"
                  : "Nenhuma entrada registrada ainda"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="text-white/40 text-xs font-semibold text-left px-6 py-3">
                      Produto
                    </th>
                    <th className="text-white/40 text-xs font-semibold text-left px-4 py-3">
                      Motivo
                    </th>
                    <th className="text-white/40 text-xs font-semibold text-center px-4 py-3">
                      Qtd
                    </th>
                    <th className="text-white/40 text-xs font-semibold text-right px-4 py-3">
                      Custo unit.
                    </th>
                    <th className="text-white/40 text-xs font-semibold text-center px-4 py-3">
                      Data
                    </th>
                    <th className="text-white/40 text-xs font-semibold text-center px-6 py-3">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {entradas.map((m) => (
                    <tr
                      key={m.id}
                      className="border-t border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 text-white font-medium">
                        {m.produto?.nome ?? "—"}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                            MOTIVO_MOVIMENTO_STYLES[m.motivo] ?? ""
                          }`}
                        >
                          {MOTIVO_MOVIMENTO_LABEL[m.motivo] ?? m.motivo}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center text-white/70 tabular-nums">
                        {m.quantidade}
                      </td>
                      <td className="px-4 py-4 text-right text-white/70 tabular-nums">
                        {m.custoUnitario ? formatBRL(m.custoUnitario) : "—"}
                      </td>
                      <td className="px-4 py-4 text-center text-white/40 font-mono text-xs">
                        {formatDateBR(m.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => setModalExcluir(m)}
                            className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-all active:scale-95"
                          >
                            <Trash2 className="h-3 w-3" /> Excluir
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
      </div>

      {/* MODAL FORM */}
      {modalForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-primary w-full max-w-2xl rounded-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-primary z-10">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                  <PackageCheck className="h-3 w-3" />
                </span>
                <h2 className="text-base font-bold text-white">Nova Entrada</h2>
              </div>
              <button
                onClick={() => !submitting && setModalForm(false)}
                disabled={submitting}
                className="text-white/30 hover:text-white/70 transition disabled:opacity-30"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitError && (
              <div className="mx-6 mt-4 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="flex-1 text-red-400 text-sm font-medium">
                  {submitError}
                </p>
              </div>
            )}

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Produto" required>
                <select
                  value={form.produtoId}
                  onChange={(e) =>
                    setForm({ ...form, produtoId: e.target.value })
                  }
                  className={`${selectClass} ${
                    formErrors.produtoId ? "border-red-400/50" : ""
                  }`}
                >
                  <option value="" className="bg-[#0f2f52]">
                    {produtos.length === 0
                      ? "Nenhum produto cadastrado"
                      : "Selecione..."}
                  </option>
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#0f2f52]">
                      {p.nome}
                    </option>
                  ))}
                </select>
                {formErrors.produtoId && (
                  <p className="text-red-400 text-xs">{formErrors.produtoId}</p>
                )}
              </Field>

              <Field label="Motivo" required>
                <select
                  value={form.motivo}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      motivo: e.target.value as MotivoMovimento,
                    })
                  }
                  className={selectClass}
                >
                  {MOTIVO_ENTRADA_OPTIONS.map((m) => (
                    <option key={m} value={m} className="bg-[#0f2f52]">
                      {MOTIVO_MOVIMENTO_LABEL[m]}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Fornecedor">
                <select
                  value={form.fornecedorId}
                  onChange={(e) =>
                    setForm({ ...form, fornecedorId: e.target.value })
                  }
                  className={selectClass}
                >
                  <option value="" className="bg-[#0f2f52]">
                    —
                  </option>
                  {fornecedores.map((f) => (
                    <option key={f.id} value={f.id} className="bg-[#0f2f52]">
                      {f.razaoSocial}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Quantidade" required>
                <input
                  type="number"
                  min={1}
                  value={form.quantidade}
                  onChange={(e) =>
                    setForm({ ...form, quantidade: e.target.value })
                  }
                  placeholder="0"
                  className={`${inputClass} ${
                    formErrors.quantidade ? "border-red-400/50" : ""
                  }`}
                />
                {formErrors.quantidade && (
                  <p className="text-red-400 text-xs">
                    {formErrors.quantidade}
                  </p>
                )}
              </Field>

              <Field label="Custo unitário (R$)">
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={form.custoUnitario}
                  onChange={(e) =>
                    setForm({ ...form, custoUnitario: e.target.value })
                  }
                  placeholder="0,00"
                  className={inputClass}
                />
              </Field>

              <Field label="Observações" className="md:col-span-2">
                <textarea
                  value={form.observacoes}
                  onChange={(e) =>
                    setForm({ ...form, observacoes: e.target.value })
                  }
                  placeholder="NF-e, condição, anotações..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-green-500/50 text-sm transition-colors resize-none"
                />
              </Field>
            </div>

            <div className="flex justify-end gap-3 px-6 pb-6 border-t border-white/10 pt-4">
              <button
                onClick={() => !submitting && setModalForm(false)}
                disabled={submitting}
                className="px-5 h-10 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvar}
                disabled={submitting}
                className="flex items-center gap-2 px-6 h-10 rounded-xl bg-green-500 hover:bg-green-400 text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-60"
              >
                {submitting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {submitting ? "Salvando..." : "Registrar Entrada"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EXCLUIR */}
      {modalExcluir && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-primary w-full max-w-sm rounded-2xl border border-red-500/30 p-6 space-y-4 text-center">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
            </div>
            <h2 className="text-white font-bold text-lg">Excluir entrada?</h2>
            <p className="text-white/50 text-sm">
              Deseja excluir a entrada de{" "}
              <span className="text-white font-semibold">
                {modalExcluir.produto?.nome ?? "produto"}
              </span>
              ? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => !isDeleting && setModalExcluir(null)}
                disabled={isDeleting}
                className="flex-1 h-10 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarExclusao}
                disabled={isDeleting}
                className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {isDeleting ? "Excluindo..." : "Sim, excluir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCESSO */}
      {sucesso && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-primary w-full max-w-xs rounded-2xl border border-white/10 p-6 space-y-4 text-center">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <PackageCheck className="h-6 w-6 text-green-400" />
              </div>
            </div>
            <h2 className="text-white font-bold text-base">{sucesso}</h2>
            <p className="text-xs text-white/30">Fechando automaticamente…</p>
          </div>
        </div>
      )}
    </div>
  );
}
