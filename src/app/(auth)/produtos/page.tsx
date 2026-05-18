"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import axios from "axios";
import {
  Plus, Search, X, Pencil, Trash2, AlertCircle, Package,
  Loader2, Save,
} from "lucide-react";
import {
  listProdutos,
  updateProduto,
  deleteProduto,
  type Produto,
} from "@/services/produtos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { extractApiError } from "@/lib/utils/api-errors";

const inputClass =
  "w-full h-10 px-3 rounded-lg bg-white/5 text-white border border-white/10 placeholder:text-white/25 focus:outline-none focus:border-green-500/50 text-sm transition-colors";

function fmtBRL(value: string | number): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProdutosPage() {
  const [lista, setLista] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [editando, setEditando] = useState<Produto | null>(null);
  const [excluindo, setExcluindo] = useState<Produto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const doFetch = useCallback(async (s: string) => {
    setError(null);
    try {
      const result = await listProdutos({
        limit: 100,
        ...(s.trim() && { search: s.trim() }),
      });
      setLista(result.data);
    } catch (err) {
      setError(extractApiError(err, "Não foi possível carregar os produtos."));
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    doFetch("").finally(() => setLoading(false));
  }, [doFetch]);

  useEffect(() => {
    if (loading) return;
    const h = setTimeout(() => doFetch(search), 300);
    return () => clearTimeout(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function confirmarExclusao() {
    if (!excluindo) return;
    setIsDeleting(true);
    try {
      await deleteProduto(excluindo.id);
      setLista((prev) => prev.filter((p) => p.id !== excluindo.id));
      setExcluindo(null);
    } catch (err) {
      setError(extractApiError(err, "Erro ao excluir o produto."));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      {editando && (
        <ModalEditar
          produto={editando}
          onClose={() => setEditando(null)}
          onSaved={(updated) => {
            setLista((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            setEditando(null);
          }}
        />
      )}

      <ConfirmDialog
        open={!!excluindo}
        onOpenChange={(open) => !open && setExcluindo(null)}
        onConfirm={confirmarExclusao}
        isConfirming={isDeleting}
        title="Excluir produto?"
        description={
          <>
            <span className="font-semibold text-white">{excluindo?.nome}</span>{" "}
            vai sumir da lista e dos pedidos. Essa ação não tem volta.
          </>
        }
      />

      <div className="w-full min-h-screen bg-secondary p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-6xl space-y-6">

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Produtos</h1>
              <p className="text-sm text-white/45 mt-1">
                {loading
                  ? "Carregando..."
                  : lista.length === 0
                    ? "O que você vende, num só lugar."
                    : `${lista.length} ${lista.length === 1 ? "cadastrado" : "cadastrados"}`}
              </p>
            </div>
            <Link href="/produtos/cadastro">
              <Button className="bg-brand hover:bg-brand-strong text-white font-semibold rounded-lg px-5 glow-brand glow-brand-hover transition-base">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </Link>
          </div>

          {error && (
            <div className="flex flex-wrap items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-red-400 text-sm font-medium">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    doFetch(search).finally(() => setLoading(false));
                  }}
                  className="text-xs text-red-300 hover:underline mt-1"
                >
                  Tentar novamente
                </button>
              </div>
              <button onClick={() => setError(null)} className="text-red-400/60 hover:text-red-400">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              type="text"
              placeholder="Buscar por nome ou SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-primary border-white/10 text-white placeholder:text-white/30 focus:border-green-500/50 h-11 text-sm"
            />
          </div>

          {loading ? (
            <div className="bg-primary rounded-2xl border border-white/10 p-16 text-center">
              <Loader2 className="w-8 h-8 text-green-400 mx-auto mb-3 animate-spin" />
              <p className="text-sm text-white/40">Carregando produtos...</p>
            </div>
          ) : lista.length === 0 && !error ? (
            <div className="bg-primary rounded-2xl border border-white/10 p-12 md:p-16 text-center">
              <Package className="w-10 h-10 text-white/15 mx-auto mb-3" />
              {search ? (
                <p className="text-sm text-white/40">
                  Nada encontrado pra <span className="text-white/60">&quot;{search}&quot;</span>.
                </p>
              ) : (
                <>
                  <h3 className="text-base font-semibold text-white">
                    Nenhum produto por aqui ainda
                  </h3>
                  <p className="text-sm text-white/45 mt-1.5 max-w-sm mx-auto">
                    Cadastre o que você vende pra usar nos pedidos, no estoque e nos relatórios.
                  </p>
                  <Link href="/produtos/cadastro" className="inline-block mt-5">
                    <Button className="bg-brand hover:bg-brand-strong text-white font-semibold">
                      <Plus className="mr-2 h-4 w-4" />
                      Cadastrar o primeiro
                    </Button>
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 overflow-hidden bg-primary">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Nome</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Código</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Preço</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Aviso</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lista.map((p) => (
                      <tr key={p.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-white font-medium">{p.nome}</td>
                        <td className="px-4 py-4 text-white/70 font-mono text-xs">{p.sku ?? "—"}</td>
                        <td className="px-4 py-4 text-white text-right font-semibold tabular-nums">{fmtBRL(p.preco)}</td>
                        <td className="px-4 py-4 text-center text-white/70">{p.estoqueMinimo}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setEditando(p)}
                              title="Editar"
                              className="p-2 rounded-lg text-white/40 hover:text-green-400 hover:bg-green-500/10 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setExcluindo(p)}
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
            </div>
          )}

        </div>
      </div>
    </>
  );
}

function ModalEditar({
  produto, onClose, onSaved,
}: {
  produto: Produto;
  onClose: () => void;
  onSaved: (p: Produto) => void;
}) {
  const [form, setForm] = useState({
    nome: produto.nome,
    sku: produto.sku ?? "",
    descricao: produto.descricao ?? "",
    preco: produto.preco,
    estoqueMinimo: produto.estoqueMinimo,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      const updated = await updateProduto(produto.id, {
        nome: form.nome,
        sku: form.sku || undefined,
        descricao: form.descricao || undefined,
        preco: parseFloat(String(form.preco)) || 0,
        estoqueMinimo: Number(form.estoqueMinimo) || 0,
      });
      onSaved(updated);
    } catch (e2) {
      setErr(extractApiError(e2, "Erro ao salvar o produto."));
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-primary border border-white/10 text-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-brand/20 flex items-center justify-center">
              <Pencil className="w-3.5 h-3.5 text-brand" />
            </div>
            <h2 className="text-base font-bold">Editar produto</h2>
          </div>
          <button onClick={onClose} disabled={saving} className="text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-white/55 text-xs font-semibold uppercase tracking-wider">
              Nome <span className="text-brand">*</span>
            </label>
            <input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              required
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-white/55 text-xs font-semibold uppercase tracking-wider">Código</label>
              <input
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="Opcional"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-white/55 text-xs font-semibold uppercase tracking-wider">Preço</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.preco}
                  onChange={(e) => setForm({ ...form, preco: e.target.value as unknown as string })}
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-white/55 text-xs font-semibold uppercase tracking-wider">Descrição</label>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-white/55 text-xs font-semibold uppercase tracking-wider">Aviso de baixo estoque</label>
            <input
              type="number"
              min="0"
              value={form.estoqueMinimo}
              onChange={(e) => setForm({ ...form, estoqueMinimo: Number(e.target.value) })}
              className={inputClass}
            />
            <p className="text-xs text-white/35">Te avisa quando sobrar essa quantidade ou menos.</p>
          </div>

          {err && (
            <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-3 text-sm text-red-300">
              {err}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving} className="border border-white/10 text-white/70 hover:bg-white/5">
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="bg-brand hover:bg-brand-strong text-white font-semibold glow-brand glow-brand-hover">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

