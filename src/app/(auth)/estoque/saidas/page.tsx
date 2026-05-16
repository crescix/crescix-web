"use client";

import { useState, useEffect } from "react";
import {
  Search, X, Pencil, Trash2, AlertCircle,
  PackageMinus, Plus, ChevronLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Saida = {
  id: number;
  produto: string;
  motivo: string;
  quantidade: number;
  precoVenda: string;
  data: string;
  notaFiscal: string;
  observacoes: string;
};

const MOTIVOS = ["Venda", "Consumo Interno", "Devolução", "Perda / Avaria", "Outros"];

const SEED_SAIDAS: Saida[] = [
  { id: 1, produto: "Camiseta Preta",    motivo: "Venda",            quantidade: 10, precoVenda: "39,90", data: "2026-05-02", notaFiscal: "NF-101", observacoes: "" },
  { id: 2, produto: "Calça Jeans Slim",  motivo: "Venda",            quantidade: 5,  precoVenda: "99,90", data: "2026-05-04", notaFiscal: "NF-102", observacoes: "" },
  { id: 3, produto: "Tênis Branco",      motivo: "Perda / Avaria",   quantidade: 2,  precoVenda: "",      data: "2026-05-08", notaFiscal: "",       observacoes: "Avaria no transporte" },
];

function getLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch { return fallback; }
}

function setLS<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

const inputClass  = "w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-cyan-500/50 text-sm transition-colors";
const selectClass = "w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 text-sm transition-colors cursor-pointer";

function Field({ label, required, children, className = "" }: {
  label: string; required?: boolean; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-white/50 text-xs font-semibold uppercase tracking-wide">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

type FormState = {
  produto: string;
  motivo: string;
  quantidade: string;
  precoVenda: string;
  data: string;
  notaFiscal: string;
  observacoes: string;
};

const FORM_VAZIO: FormState = {
  produto: "", motivo: "", quantidade: "", precoVenda: "",
  data: new Date().toISOString().split("T")[0], notaFiscal: "", observacoes: "",
};

export default function SaidasEstoque() {
  const router = useRouter();

  const [saidas,      setSaidas]      = useState<Saida[]>([]);
  const [produtos,    setProdutos]    = useState<string[]>([]);

  const [form,        setForm]        = useState<FormState>(FORM_VAZIO);
  const [formErrors,  setFormErrors]  = useState<Partial<FormState>>({});
  const [editandoId,  setEditandoId]  = useState<number | null>(null);

  const [filtros, setFiltros] = useState({ busca: "", motivo: "", dataInicio: "", dataFim: "" });
  const [resultado, setResultado] = useState<Saida[]>([]);
  const [buscou,    setBuscou]    = useState(false);

  const [modalForm,    setModalForm]    = useState(false);
  const [modalExcluir, setModalExcluir] = useState<Saida | null>(null);
  const [sucesso,      setSucesso]      = useState<string | null>(null);

  useEffect(() => {
    let lista = getLS<Saida[]>("saidas_estoque", []);
    if (lista.length === 0) { setLS("saidas_estoque", SEED_SAIDAS); lista = SEED_SAIDAS; }
    setSaidas(lista);

    const prods = getLS<any[]>("produtos", []);
    setProdutos(prods.map((p) => p.nome).filter(Boolean));
  }, []);

  // Fecha modal de sucesso automaticamente
  useEffect(() => {
    if (!sucesso) return;
    const t = setTimeout(() => setSucesso(null), 2000);
    return () => clearTimeout(t);
  }, [sucesso]);

  function salvarSaidas(nova: Saida[]) {
    setLS("saidas_estoque", nova);
    setSaidas(nova);
  }

  function validar(): boolean {
    const erros: Partial<FormState> = {};
    if (!form.produto)                          erros.produto    = "Obrigatório";
    if (!form.motivo)                           erros.motivo     = "Obrigatório";
    if (!form.quantidade || Number(form.quantidade) <= 0) erros.quantidade = "Obrigatório";
    if (!form.data)                             erros.data       = "Obrigatório";
    setFormErrors(erros);
    return Object.keys(erros).length === 0;
  }

  function handleSalvar() {
    if (!validar()) return;

    if (editandoId !== null) {
      const atualizadas = saidas.map((s) =>
        s.id === editandoId ? { ...s, ...form, quantidade: Number(form.quantidade) } : s
      );
      salvarSaidas(atualizadas);
      if (buscou) buscar(atualizadas);
      setSucesso("Saída atualizada com sucesso!");
    } else {
      const nova: Saida = { id: Date.now(), ...form, quantidade: Number(form.quantidade) };
      const atualizadas = [nova, ...saidas];
      salvarSaidas(atualizadas);
      if (buscou) buscar(atualizadas);
      setSucesso("Saída registrada com sucesso!");
    }

    setModalForm(false);
    setForm(FORM_VAZIO);
    setEditandoId(null);
    setFormErrors({});
  }

  function abrirEditar(saida: Saida) {
    setForm({
      produto:     saida.produto,
      motivo:      saida.motivo,
      quantidade:  String(saida.quantidade),
      precoVenda:  saida.precoVenda,
      data:        saida.data,
      notaFiscal:  saida.notaFiscal,
      observacoes: saida.observacoes,
    });
    setEditandoId(saida.id);
    setFormErrors({});
    setModalForm(true);
  }

  function confirmarExclusao() {
    if (!modalExcluir) return;
    const atualizadas = saidas.filter((s) => s.id !== modalExcluir.id);
    salvarSaidas(atualizadas);
    if (buscou) buscar(atualizadas);
    setModalExcluir(null);
    setSucesso("Saída excluída com sucesso!");
  }

  function buscar(lista: Saida[] = saidas) {
    const r = lista.filter((s) => {
      const mBusca  = !filtros.busca   || s.produto.toLowerCase().includes(filtros.busca.toLowerCase()) || s.notaFiscal.toLowerCase().includes(filtros.busca.toLowerCase());
      const mMotivo = !filtros.motivo  || s.motivo === filtros.motivo;
      const mInicio = !filtros.dataInicio || s.data >= filtros.dataInicio;
      const mFim    = !filtros.dataFim    || s.data <= filtros.dataFim;
      return mBusca && mMotivo && mInicio && mFim;
    });
    setResultado(r);
    setBuscou(true);
  }

  function limpar() {
    setFiltros({ busca: "", motivo: "", dataInicio: "", dataFim: "" });
    setResultado([]);
    setBuscou(false);
  }

  const totalQuantidade = resultado.reduce((acc, s) => acc + s.quantidade, 0);

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
                Saídas
              </h1>
            </div>
          </div>
          <button
            onClick={() => { setForm(FORM_VAZIO); setEditandoId(null); setFormErrors({}); setModalForm(true); }}
            className="flex items-center gap-2 px-5 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-bold transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" /> Nova Saída
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-primary rounded-2xl border border-white/10 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Search className="h-3 w-3" />
            </span>
            <h2 className="text-base font-bold text-white">Filtrar Saídas</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Produto ou NF-e">
              <input
                value={filtros.busca}
                onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && buscar()}
                placeholder="Buscar por produto ou NF"
                className={inputClass}
              />
            </Field>

            <Field label="Motivo">
              <select
                value={filtros.motivo}
                onChange={(e) => setFiltros({ ...filtros, motivo: e.target.value })}
                className={selectClass}
              >
                <option value="" className="bg-[#0f2f52]">Todos</option>
                {MOTIVOS.map((m) => (
                  <option key={m} value={m} className="bg-[#0f2f52]">{m}</option>
                ))}
              </select>
            </Field>

            <Field label="Data início">
              <input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                className={inputClass}
              />
            </Field>

            <Field label="Data fim">
              <input
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            {buscou && (
              <button
                onClick={limpar}
                className="flex items-center gap-2 px-5 h-10 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 text-sm font-semibold transition-all active:scale-95"
              >
                <X className="h-4 w-4" /> Limpar
              </button>
            )}
            <button
              onClick={() => buscar()}
              className="flex items-center gap-2 px-6 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-bold transition-all active:scale-95"
            >
              <Search className="h-4 w-4" /> Buscar
            </button>
          </div>
        </div>

        {/* Resultados */}
        {buscou && (
          <div className="bg-primary rounded-2xl border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <PackageMinus className="h-3 w-3" />
                </span>
                <h2 className="text-base font-bold text-white">Resultados</h2>
              </div>
              <div className="flex items-center gap-4">
                {resultado.length > 0 && (
                  <span className="text-white/40 text-xs">
                    Total: <span className="text-white font-semibold">{totalQuantidade} unidades</span>
                  </span>
                )}
                <span className="text-white/40 text-xs">
                  {resultado.length} {resultado.length === 1 ? "saída encontrada" : "saídas encontradas"}
                </span>
              </div>
            </div>

            {resultado.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <PackageMinus className="h-8 w-8 text-white/15" />
                <p className="text-white/30 text-sm">Nenhuma saída encontrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="text-white/40 text-xs font-semibold text-left px-6 py-3">Produto</th>
                      <th className="text-white/40 text-xs font-semibold text-left px-4 py-3">Motivo</th>
                      <th className="text-white/40 text-xs font-semibold text-center px-4 py-3">Qtd</th>
                      <th className="text-white/40 text-xs font-semibold text-center px-4 py-3">Preço Venda</th>
                      <th className="text-white/40 text-xs font-semibold text-center px-4 py-3">Data</th>
                      <th className="text-white/40 text-xs font-semibold text-center px-4 py-3">NF-e</th>
                      <th className="text-white/40 text-xs font-semibold text-center px-6 py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.map((saida) => (
                      <tr key={saida.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-white font-medium">{saida.produto}</td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                            saida.motivo === "Venda"            ? "bg-green-500/10 text-green-400 border-green-500/20"  :
                            saida.motivo === "Perda / Avaria"   ? "bg-red-500/10 text-red-400 border-red-500/20"        :
                            saida.motivo === "Devolução"        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                            saida.motivo === "Consumo Interno"  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"     :
                            "bg-white/5 text-white/40 border-white/10"
                          }`}>
                            {saida.motivo}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center text-white/70">{saida.quantidade}</td>
                        <td className="px-4 py-4 text-center text-white/70">
                          {saida.precoVenda ? `R$ ${saida.precoVenda}` : "—"}
                        </td>
                        <td className="px-4 py-4 text-center text-white/40 font-mono text-xs">
                          {new Date(saida.data + "T00:00:00").toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-4 py-4 text-center text-white/40 font-mono text-xs">
                          {saida.notaFiscal || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => abrirEditar(saida)}
                              className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold transition-all active:scale-95"
                            >
                              <Pencil className="h-3 w-3" /> Alterar
                            </button>
                            <button
                              onClick={() => setModalExcluir(saida)}
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
        )}
      </div>

      {/* MODAL FORM */}
      {modalForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-primary w-full max-w-2xl rounded-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-primary z-10">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <PackageMinus className="h-3 w-3" />
                </span>
                <h2 className="text-base font-bold text-white">
                  {editandoId !== null ? "Editar Saída" : "Nova Saída"}
                </h2>
              </div>
              <button onClick={() => setModalForm(false)} className="text-white/30 hover:text-white/70 transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">

              <Field label="Produto" required>
                {produtos.length > 0 ? (
                  <select
                    value={form.produto}
                    onChange={(e) => setForm({ ...form, produto: e.target.value })}
                    className={`${selectClass} ${formErrors.produto ? "border-red-400/50" : ""}`}
                  >
                    <option value="" className="bg-[#0f2f52]">Selecione...</option>
                    {produtos.map((p) => <option key={p} value={p} className="bg-[#0f2f52]">{p}</option>)}
                  </select>
                ) : (
                  <input
                    value={form.produto}
                    onChange={(e) => setForm({ ...form, produto: e.target.value })}
                    placeholder="Nome do produto"
                    className={`${inputClass} ${formErrors.produto ? "border-red-400/50" : ""}`}
                  />
                )}
                {formErrors.produto && <p className="text-red-400 text-xs">{formErrors.produto}</p>}
              </Field>

              <Field label="Motivo" required>
                <select
                  value={form.motivo}
                  onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                  className={`${selectClass} ${formErrors.motivo ? "border-red-400/50" : ""}`}
                >
                  <option value="" className="bg-[#0f2f52]">Selecione...</option>
                  {MOTIVOS.map((m) => <option key={m} value={m} className="bg-[#0f2f52]">{m}</option>)}
                </select>
                {formErrors.motivo && <p className="text-red-400 text-xs">{formErrors.motivo}</p>}
              </Field>

              <Field label="Quantidade" required>
                <input
                  type="number" min={1}
                  value={form.quantidade}
                  onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
                  placeholder="0"
                  className={`${inputClass} ${formErrors.quantidade ? "border-red-400/50" : ""}`}
                />
                {formErrors.quantidade && <p className="text-red-400 text-xs">{formErrors.quantidade}</p>}
              </Field>

              <Field label="Preço de Venda">
                <input
                  value={form.precoVenda}
                  onChange={(e) => setForm({ ...form, precoVenda: e.target.value })}
                  placeholder="R$ 0,00"
                  className={inputClass}
                />
              </Field>

              <Field label="Data" required>
                <input
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                  className={`${inputClass} ${formErrors.data ? "border-red-400/50" : ""}`}
                />
                {formErrors.data && <p className="text-red-400 text-xs">{formErrors.data}</p>}
              </Field>

              <Field label="Nota Fiscal / NF-e">
                <input
                  value={form.notaFiscal}
                  onChange={(e) => setForm({ ...form, notaFiscal: e.target.value })}
                  placeholder="Ex: NF-201"
                  className={inputClass}
                />
              </Field>

              <Field label="Observações" className="md:col-span-2">
                <textarea
                  value={form.observacoes}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                  placeholder="Observações opcionais..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-cyan-500/50 text-sm transition-colors resize-none"
                />
              </Field>
            </div>

            <div className="flex justify-end gap-3 px-6 pb-6 border-t border-white/10 pt-4">
              <button
                onClick={() => setModalForm(false)}
                className="px-5 h-10 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 text-sm font-semibold transition-all active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvar}
                className="px-6 h-10 rounded-xl bg-green-500 hover:bg-green-400 text-white text-sm font-bold transition-all active:scale-95"
              >
                {editandoId !== null ? "Salvar Alterações" : "Registrar Saída"}
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
            <h2 className="text-white font-bold text-lg">Excluir saída?</h2>
            <p className="text-white/50 text-sm">
              Deseja excluir a saída de{" "}
              <span className="text-white font-semibold">{modalExcluir.produto}</span>?{" "}
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setModalExcluir(null)}
                className="flex-1 h-10 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 text-sm font-semibold transition-all active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarExclusao}
                className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-bold transition-all active:scale-95"
              >
                Sim, excluir
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
                <PackageMinus className="h-6 w-6 text-green-400" />
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