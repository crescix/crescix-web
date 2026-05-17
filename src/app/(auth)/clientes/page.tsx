"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import axios from "axios";
import {
  Plus, Search, X, Pencil, Trash2, AlertCircle, Users,
  Loader2, AlertTriangle, Save,
} from "lucide-react";
import {
  listClientes,
  updateCliente,
  deleteCliente,
  type Cliente,
  type ClienteUpdate,
} from "@/services/clientes";
import { maskCPF, maskPhone } from "@/lib/utils/masks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const inputClass =
  "w-full h-10 px-3 rounded-lg bg-white/5 text-white border border-white/10 placeholder:text-white/25 focus:outline-none focus:border-green-500/50 text-sm transition-colors";
const selectClass =
  "w-full h-10 px-3 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-green-500/50 text-sm transition-colors";

function extractMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err) && err.response?.data?.message) {
    return err.response.data.message;
  }
  return fallback;
}

export default function ClientesPage() {
  const [lista, setLista] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | "ATIVO" | "INATIVO">("");
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [excluindo, setExcluindo] = useState<Cliente | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const doFetch = useCallback(async (s: string, st: "" | "ATIVO" | "INATIVO") => {
    setError(null);
    try {
      const result = await listClientes({
        limit: 100,
        ...(s.trim() && { search: s.trim() }),
        ...(st && { status: st }),
      });
      setLista(result.data);
    } catch (err) {
      setError(extractMessage(err, "Não foi possível carregar os clientes."));
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    doFetch("", "").finally(() => setLoading(false));
  }, [doFetch]);

  useEffect(() => {
    if (loading) return;
    const h = setTimeout(() => doFetch(search, status), 300);
    return () => clearTimeout(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  async function confirmarExclusao() {
    if (!excluindo) return;
    setIsDeleting(true);
    try {
      await deleteCliente(excluindo.id);
      setLista((prev) => prev.filter((c) => c.id !== excluindo.id));
      setExcluindo(null);
    } catch (err) {
      setError(extractMessage(err, "Erro ao excluir o cliente."));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      {editando && (
        <ModalEditar
          cliente={editando}
          onClose={() => setEditando(null)}
          onSaved={(updated) => {
            setLista((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
            setEditando(null);
          }}
        />
      )}

      {excluindo && (
        <ModalExcluir
          cliente={excluindo}
          isDeleting={isDeleting}
          onConfirm={confirmarExclusao}
          onCancel={() => setExcluindo(null)}
        />
      )}

      <div className="w-full min-h-screen bg-secondary p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-6xl space-y-6">

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">Cadastros</p>
              <h1 className="text-3xl font-black text-white tracking-tighter">Clientes</h1>
              <p className="text-sm text-white/40 mt-1">
                {loading ? "Carregando..." : `${lista.length} ${lista.length === 1 ? "cliente" : "clientes"}`}
              </p>
            </div>
            <Link href="/clientes/cadastro">
              <Button className="bg-green-500 hover:bg-green-400 text-white font-bold rounded-full px-5 transition-all hover:scale-105 active:scale-95">
                <Plus className="mr-2 h-4 w-4" />
                Novo Cliente
              </Button>
            </Link>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-red-400 text-sm font-medium">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    doFetch(search, status).finally(() => setLoading(false));
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

          <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-3 bg-primary p-4 rounded-2xl border border-white/5">
            <div className="space-y-1.5">
              <label className="text-white/50 text-xs font-medium block">Buscar por nome, CPF ou e-mail</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                <Input
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-green-500/50 h-9 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-white/50 text-xs font-medium block">Situação</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "" | "ATIVO" | "INATIVO")}
                className={selectClass}
              >
                <option value="">Todos</option>
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="bg-primary rounded-2xl border border-white/10 p-16 text-center">
              <Loader2 className="w-8 h-8 text-green-400 mx-auto mb-3 animate-spin" />
              <p className="text-sm text-white/40">Carregando clientes...</p>
            </div>
          ) : lista.length === 0 && !error ? (
            <div className="bg-primary rounded-2xl border border-white/10 p-16 text-center">
              <Users className="w-10 h-10 text-white/15 mx-auto mb-3" />
              <p className="text-sm text-white/40">
                {search || status
                  ? "Nenhum cliente encontrado para os filtros."
                  : "Você ainda não cadastrou nenhum cliente."}
              </p>
              {!search && !status && (
                <Link href="/clientes/cadastro" className="inline-block mt-3">
                  <Button size="sm" className="bg-green-500 hover:bg-green-400 text-white font-bold">
                    <Plus className="mr-2 h-4 w-4" />
                    Cadastrar primeiro
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 overflow-hidden bg-primary">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Nome</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">CPF</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Telefone</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">E-mail</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Status</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lista.map((c) => (
                      <tr key={c.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-white font-medium">{c.nome}</td>
                        <td className="px-4 py-4 text-white/70 font-mono text-xs">{c.cpf ?? "—"}</td>
                        <td className="px-4 py-4 text-white/70">{c.telefone ?? "—"}</td>
                        <td className="px-4 py-4 text-white/70">{c.email ?? "—"}</td>
                        <td className="px-4 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            c.status === "ATIVO"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}>
                            {c.status === "ATIVO" ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setEditando(c)}
                              title="Editar"
                              className="p-2 rounded-lg text-white/40 hover:text-green-400 hover:bg-green-500/10 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setExcluindo(c)}
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
  cliente, onClose, onSaved,
}: {
  cliente: Cliente;
  onClose: () => void;
  onSaved: (c: Cliente) => void;
}) {
  const [form, setForm] = useState<ClienteUpdate>({
    nome: cliente.nome,
    cpf: cliente.cpf ? maskCPF(cliente.cpf) : "",
    telefone: cliente.telefone ? maskPhone(cliente.telefone) : "",
    email: cliente.email ?? "",
    status: cliente.status,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      const updated = await updateCliente(cliente.id, {
        nome: form.nome,
        cpf: form.cpf || undefined,
        telefone: form.telefone || undefined,
        email: form.email || undefined,
        status: form.status,
      });
      onSaved(updated);
    } catch (e2) {
      setErr(extractMessage(e2, "Erro ao salvar o cliente."));
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-primary border border-white/10 text-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center">
              <Pencil className="w-3.5 h-3.5 text-green-400" />
            </div>
            <h2 className="text-base font-bold">Editar Cliente</h2>
          </div>
          <button onClick={onClose} disabled={saving} className="text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-white/50 text-xs font-medium">Nome *</label>
            <input
              value={form.nome ?? ""}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              required
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-white/50 text-xs font-medium">CPF</label>
            <input
              value={form.cpf ?? ""}
              onChange={(e) => setForm({ ...form, cpf: maskCPF(e.target.value) })}
              placeholder="000.000.000-00"
              inputMode="numeric"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-white/50 text-xs font-medium">Telefone</label>
              <input
                value={form.telefone ?? ""}
                onChange={(e) => setForm({ ...form, telefone: maskPhone(e.target.value) })}
                placeholder="+55 (11) 99999-9999"
                inputMode="numeric"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-white/50 text-xs font-medium">Status</label>
              <select
                value={form.status ?? "ATIVO"}
                onChange={(e) => setForm({ ...form, status: e.target.value as "ATIVO" | "INATIVO" })}
                className={selectClass}
              >
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-white/50 text-xs font-medium">E-mail</label>
            <input
              type="email"
              value={form.email ?? ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@dominio.com"
              className={inputClass}
            />
          </div>

          {err && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
              {err}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving} className="border border-white/10 text-white hover:bg-white/10">
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="bg-green-500 hover:bg-green-400 text-white font-bold">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalExcluir({
  cliente, isDeleting, onConfirm, onCancel,
}: {
  cliente: Cliente;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} className="bg-primary border border-red-500/30 text-white w-full max-w-sm rounded-2xl p-6 space-y-4 shadow-2xl">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <h2 className="text-white font-bold text-lg">Excluir cliente?</h2>
          <p className="text-white/60 text-sm">
            Deseja excluir <span className="text-white font-semibold">{cliente.nome}</span>? Esta ação não poderá ser desfeita.
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isDeleting} className="flex-1 border border-white/10 text-white hover:bg-white/10">
            Cancelar
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isDeleting} className="flex-1">
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            {isDeleting ? "Excluindo..." : "Sim, excluir"}
          </Button>
        </div>
      </div>
    </div>
  );
}
