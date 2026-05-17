"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import {
  User, ChevronLeft, Save, X, CheckCircle2, AlertCircle, Loader2,
} from "lucide-react";
import { createCliente } from "@/services/clientes";
import { maskCPF, maskPhone } from "@/lib/utils/masks";
import { extractApiError } from "@/lib/utils/api-errors";

const inputClass =
  "w-full px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-green-500/50 transition-colors";
const selectClass =
  "w-full px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50 transition-colors cursor-pointer";

export default function CadastroCliente() {
  const router = useRouter();
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    telefone: "",
    email: "",
    saldo: "0",
    status: "ATIVO" as "ATIVO" | "INATIVO",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.nome.trim()) {
      setError("Informe o nome do cliente.");
      return;
    }

    setSaving(true);
    try {
      await createCliente({
        nome: form.nome.trim(),
        cpf: form.cpf.trim() || undefined,
        telefone: form.telefone.trim() || undefined,
        email: form.email.trim() || undefined,
        saldo: parseFloat(form.saldo) || 0,
        status: form.status,
      });
      setSuccess(true);
    } catch (err) {
      setError(extractApiError(err, "Erro ao cadastrar o cliente. Tente novamente."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full min-h-screen bg-secondary p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-6">

        <div className="flex items-center gap-4">
          <Link href="/clientes" className="p-2 rounded-xl text-white/50 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">
              Cadastros / Clientes
            </p>
            <h1 className="text-3xl font-black text-white tracking-tighter">
              Novo Cliente
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-primary rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs font-bold flex items-center justify-center">1</span>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-white/50" />
                <h3 className="text-sm font-bold text-white">Dados do Cliente</h3>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider">
                  Nome <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Nome completo"
                  required
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider">CPF</label>
                <input
                  value={form.cpf}
                  onChange={(e) => setForm({ ...form, cpf: maskCPF(e.target.value) })}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider">Telefone</label>
                <input
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: maskPhone(e.target.value) })}
                  placeholder="+55 (11) 99999-9999"
                  inputMode="numeric"
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider">E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@dominio.com"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider">Saldo (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.saldo}
                  onChange={(e) => setForm({ ...form, saldo: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as "ATIVO" | "INATIVO" })}
                  className={selectClass}
                >
                  <option value="ATIVO">Ativo</option>
                  <option value="INATIVO">Inativo</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm font-medium flex-1">{error}</p>
              <button type="button" onClick={() => setError(null)} className="text-red-400/60 hover:text-red-400">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <Link href="/clientes">
              <button type="button" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 text-sm font-semibold transition-all active:scale-95">
                <X className="w-4 h-4" /> Cancelar
              </button>
            </Link>
            <button type="submit" disabled={saving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Cadastrando..." : "Cadastrar Cliente"}
            </button>
          </div>
        </form>
      </div>

      {success && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-primary w-full max-w-sm rounded-2xl border border-white/10 p-6 space-y-4 text-center">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-400" />
              </div>
            </div>
            <h2 className="text-white font-bold text-lg">Cliente cadastrado!</h2>
            <button onClick={() => router.push("/clientes")}
              className="w-full h-10 rounded-xl bg-green-500 hover:bg-green-400 text-white text-sm font-bold transition-all active:scale-95">
              Ver lista
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
