"use client";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

export interface Produto {
  id: number;
  nome: string;
  sku: string;
  unidade: string;
  preco: string;
  estoque: number;
  status: string;
  marca: string;
  secao: string;
  fornecedor: string;
}

/* ─── SEED ─────────────────────────────────────────────── */
const SEED: Produto[] = [
  {
    id: 1,
    nome: "Camiseta Preta",
    sku: "0009820",
    unidade: "un",
    preco: "29,90",
    estoque: 52,
    status: "ativo",
    marca: "Marca A",
    secao: "Roupas",
    fornecedor: "Fornecedor A",
  },
  {
    id: 2,
    nome: "Calça Jeans Slim",
    sku: "0009821",
    unidade: "un",
    preco: "89,90",
    estoque: 18,
    status: "ativo",
    marca: "Marca B",
    secao: "Roupas",
    fornecedor: "Fornecedor B",
  },
  {
    id: 3,
    nome: "Tênis Branco",
    sku: "0009822",
    unidade: "par",
    preco: "149,90",
    estoque: 9,
    status: "ativo",
    marca: "Marca C",
    secao: "Calçados",
    fornecedor: "Fornecedor A",
  },
  {
    id: 4,
    nome: "Boné Azul",
    sku: "0009823",
    unidade: "un",
    preco: "39,90",
    estoque: 0,
    status: "inativo",
    marca: "Marca A",
    secao: "Acessórios",
    fornecedor: "Fornecedor C",
  },
  {
    id: 5,
    nome: "Meia Esportiva",
    sku: "0009824",
    unidade: "par",
    preco: "12,90",
    estoque: 120,
    status: "ativo",
    marca: "Marca D",
    secao: "Roupas",
    fornecedor: "Fornecedor B",
  },
  {
    id: 6,
    nome: "Jaqueta Cinza",
    sku: "0009825",
    unidade: "un",
    preco: "199,90",
    estoque: 7,
    status: "ativo",
    marca: "Marca B",
    secao: "Roupas",
    fornecedor: "Fornecedor A",
  },
  {
    id: 7,
    nome: "Shorts Verde",
    sku: "0009826",
    unidade: "un",
    preco: "49,90",
    estoque: 33,
    status: "inativo",
    marca: "Marca C",
    secao: "Roupas",
    fornecedor: "Fornecedor C",
  },
];

function getProdutosLS(): Produto[] | null {
  try {
    const raw = localStorage.getItem("produtos");
    if (!raw) return null;
    return JSON.parse(raw) as Produto[];
  } catch {
    return null;
  }
}

function saveProdutosLS(lista: Produto[]) {
  localStorage.setItem("produtos", JSON.stringify(lista));
}

/* ─── HELPERS ───────────────────────────────────────────── */
function Badge({ status }: { status: string }) {
  return (
    <span
      className={`px-3 py-0.5 rounded-full text-xs font-semibold ${status === "ativo" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}
    >
      {status === "ativo" ? "Ativo" : "Inativo"}
    </span>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-xs text-gray-500 font-medium">{label}</label>
      {children}
    </div>
  );
}

interface SelectFieldProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  options?: string[];
  labels?: string[];
}
function SelectField({ value, onChange, placeholder, options = [], labels }: SelectFieldProps) {
  return (
    <div className="relative">
      <select
        value={value}
        title={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 border rounded-md px-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
      >
        <option value="">{placeholder}</option>
        {options.map((opt, i) => (
          <option key={opt} value={opt}>
            {labels ? labels[i] : opt}
          </option>
        ))}
      </select>
      <span className="absolute right-3 top-2.5 text-gray-400 text-xs pointer-events-none">
        ▼
      </span>
    </div>
  );
}

/* ─── MODAL FILTRO AVANÇADO ─────────────────────────────── */
export interface Filtros {
  busca: string;
  secao: string;
  fornecedor: string;
  status: string;
}

interface ModalFiltroProps {
  filtros: Filtros;
  onAplicar: (f: Filtros) => void;
  onClose: () => void;
  secoes: string[];
  fornecedores: string[];
}
function ModalFiltro({ filtros, onAplicar, onClose, secoes, fornecedores }: ModalFiltroProps) {
  const [local, setLocal] = useState<Filtros>({ ...filtros });

  function aplicar() {
    onAplicar(local);
    onClose();
  }
  function limpar() {
    onAplicar({ busca: "", secao: "", fornecedor: "", status: "" });
    onClose();
  }

  return (
    <Overlay onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-base font-bold text-[#0f2f52]">
            🔧 Filtros Avançados
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 grid gap-4">
          <Field label="Nome ou Código">
            <input
              value={local.busca}
              onChange={(e) => setLocal({ ...local, busca: e.target.value })}
              placeholder="Busca por Nome ou Código"
              className="w-full h-9 border rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Seção">
              <SelectField
                value={local.secao}
                onChange={(v) => setLocal({ ...local, secao: v })}
                placeholder="Todas as seções"
                options={secoes}
              />
            </Field>
            <Field label="Status">
              <SelectField
                value={local.status}
                onChange={(v) => setLocal({ ...local, status: v })}
                placeholder="Todos"
                options={["ativo", "inativo"]}
                labels={["Ativo", "Inativo"]}
              />
            </Field>
          </div>
          <Field label="Fornecedor">
            <SelectField
              value={local.fornecedor}
              onChange={(v) => setLocal({ ...local, fornecedor: v })}
              placeholder="Todos os fornecedores"
              options={fornecedores}
            />
          </Field>
        </div>

        <div className="flex gap-3 px-6 pb-5 justify-end">
          <button
            onClick={limpar}
            className="px-5 py-2 border rounded-md text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            Limpar Filtros
          </button>
          <button
            onClick={aplicar}
            className="px-6 py-2 bg-[#0f2f52] text-white rounded-md text-sm hover:bg-[#1a4a7a] transition"
          >
            Aplicar
          </button>
        </div>
      </div>
    </Overlay>
  );
}

/* ─── MODAL EDIÇÃO ──────────────────────────────────────── */
interface ModalEdicaoProps {
  produto: Produto;
  onSalvar: (p: Produto) => void;
  onClose: () => void;
}
function ModalEdicao({ produto, onSalvar, onClose }: ModalEdicaoProps) {
  const [form, setForm] = useState<Produto>({ ...produto });
  function ch(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "estoque" ? Number(value) : value });
  }

  return (
    <Overlay onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-base font-bold text-[#0f2f52]">
            ✏️ Editar Produto
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 grid md:grid-cols-2 gap-4">
          <Field label="Nome *" className="md:col-span-2">
            <Input
              name="nome"
              value={form.nome || ""}
              onChange={ch}
              className="w-full h-9 border rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </Field>
          <Field label="SKU / Código">
            <Input
              name="sku"
              value={form.sku || ""}
              onChange={ch}
              className="w-full h-9 border rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </Field>
          <Field label="Preço de Venda">
            <Input
              name="preco"
              value={form.preco || ""}
              onChange={ch}
              className="w-full h-9 border rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </Field>
          <Field label="Unidade">
            <Input
              name="unidade"
              value={form.unidade || ""}
              onChange={ch}
              className="w-full h-9 border rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </Field>
          <Field label="Estoque">
            <Input
              name="estoque"
              type="number"
              value={form.estoque || ""}
              onChange={ch}
              className="w-full h-9 border rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </Field>
          <Field label="Marca">
            <Input
              name="marca"
              value={form.marca || ""}
              onChange={ch}
              className="w-full h-9 border rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </Field>
          <Field label="Seção">
            <Input
              name="secao"
              value={form.secao || ""}
              onChange={ch}
              className="w-full h-9 border rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </Field>
          <Field label="Fornecedor">
            <Input
              name="fornecedor"
              value={form.fornecedor || ""}
              onChange={ch}
              className="w-full h-9 border rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </Field>
          <Field label="Status">
            <select
              name="status"
              title="Status do produto"
              value={form.status || "ativo"}
              onChange={ch}
              className="w-full h-9 border rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </Field>
        </div>

        <div className="flex gap-3 px-6 pb-5 justify-end border-t pt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 border rounded-md text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSalvar(form)}
            className="px-6 py-2 bg-[#0f2f52] text-white rounded-md text-sm hover:bg-[#1a4a7a] transition"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </Overlay>
  );
}

/* ─── MODAL EXCLUSÃO ────────────────────────────────────── */
interface ModalExclusaoProps {
  produto: Produto;
  onConfirmar: () => void;
  onClose: () => void;
}
function ModalExclusao({ produto, onConfirmar, onClose }: ModalExclusaoProps) {
  return (
    <Overlay onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm text-center p-7">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🗑️</span>
        </div>
        <h2 className="font-bold text-gray-800 text-base mb-1">
          Excluir produto?
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Tem certeza que deseja excluir{" "}
          <span className="font-semibold text-gray-700">{produto?.nome}</span>?
          <br />
          Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 border rounded-md text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="px-6 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition"
          >
            Sim, excluir
          </button>
        </div>
      </div>
    </Overlay>
  );
}

/* ─── MODAL SUCESSO ─────────────────────────────────────── */
function ModalSucesso({ mensagem, onClose }: { mensagem: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <Overlay onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs text-center p-7">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✅</span>
        </div>
        <h2 className="font-bold text-gray-800 text-base">{mensagem}</h2>
        <p className="text-xs text-gray-400 mt-1">Fechando automaticamente…</p>
      </div>
    </Overlay>
  );
}

/* ─── PÁGINA PRINCIPAL ──────────────────────────────────── */
export default function ListaProdutos() {
  const [todos, setTodos] = useState<Produto[]>([]);
  const [resultados, setResultados] = useState<Produto[]>([]);
  const [buscou, setBuscou] = useState<boolean>(false);
  const [filtros, setFiltros] = useState<Filtros>({
    busca: "",
    secao: "",
    fornecedor: "",
    status: "ativo",
  });

  const [modalFiltro, setModalFiltro] = useState<boolean>(false);
  const [modalEditar, setModalEditar] = useState<Produto | null>(null);
  const [modalExcluir, setModalExcluir] = useState<Produto | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  useEffect(() => {
    let lista = getProdutosLS();
    if (!lista || lista.length === 0) {
      saveProdutosLS(SEED);
      lista = SEED;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTodos(lista);
  }, []);

  function atualizarTodos(nova: Produto[]) {
    saveProdutosLS(nova);
    setTodos(nova);
  }

  /* ── BUSCA ── */
  function buscar(f: Filtros = filtros) {
    const lista = getProdutosLS() || [];
    const r = lista.filter((p) => {
      const mBusca =
        !f.busca ||
        p.nome?.toLowerCase().includes(f.busca.toLowerCase()) ||
        p.sku?.includes(f.busca);
      const mStatus = !f.status || p.status === f.status;
      const mSecao = !f.secao || p.secao === f.secao;
      const mForn = !f.fornecedor || p.fornecedor === f.fornecedor;
      return mBusca && mStatus && mSecao && mForn;
    });
    setResultados(r);
    setBuscou(true);
  }

  function limparBusca() {
    const vazio = { busca: "", secao: "", fornecedor: "", status: "ativo" };
    setFiltros(vazio);
    setResultados([]);
    setBuscou(false);
  }

  /* ── EDITAR ── */
  function salvarEdicao(atualizado: Produto) {
    const nova = todos.map((p) => (p.id === atualizado.id ? atualizado : p));
    atualizarTodos(nova);
    setResultados((prev) =>
      prev.map((p) => (p.id === atualizado.id ? atualizado : p)),
    );
    setModalEditar(null);
    setSucesso("Produto atualizado com sucesso!");
  }

  /* ── EXCLUIR ── */
  function confirmarExclusao() {
    if (!modalExcluir) return;
    const nova = todos.filter((p) => p.id !== modalExcluir.id);
    atualizarTodos(nova);
    setResultados((prev) => prev.filter((p) => p.id !== modalExcluir.id));
    setModalExcluir(null);
    setSucesso("Produto excluído com sucesso!");
  }

  /* ── OPÇÕES ── */
  const secoes = Array.from(new Set(todos.map((p) => p.secao).filter(Boolean)));
  const fornecedores = Array.from(new Set(todos.map((p) => p.fornecedor).filter(Boolean)));
  const filtrosAtivos = [
    filtros.busca,
    filtros.secao,
    filtros.fornecedor,
    filtros.status,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">• • •</span>
            <span className="text-gray-400">›</span>
            <h1 className="text-lg font-bold text-gray-800">Produtos</h1>
            <button className="text-xs border rounded-full px-3 py-0.5 text-gray-500 flex items-center gap-1 hover:bg-gray-50 transition ml-1">
              Todas as lojas <span>▾</span>
            </button>
          </div>
          <a
            href="/cadastro"
            className="flex items-center gap-1 bg-[#0f2f52] text-white text-sm px-4 py-2 rounded-md hover:bg-[#1a4a7a] transition font-medium"
          >
            <span className="text-base font-bold">+</span> Incluir Cadastro
          </a>
        </div>

        {/* PAINEL DE FILTRO */}
        <div className="bg-white rounded-xl border-2 border-blue-400 p-5 mb-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-700 mb-4">
            Filtro de Busca
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <Field
              label={
                <>
                  Nome ou Código <span className="text-red-500">*</span>
                </>
              }
            >
              <input
                value={filtros.busca}
                onChange={(e) =>
                  setFiltros({ ...filtros, busca: e.target.value })
                }
                onKeyDown={(e) => e.key === "Enter" && buscar()}
                placeholder="Busca por Nome ou Código"
                className="w-full h-9 border rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </Field>
            <Field label="Seção">
              <SelectField
                value={filtros.secao}
                onChange={(v) => setFiltros({ ...filtros, secao: v })}
                placeholder="Todas as seções"
                options={secoes}
              />
            </Field>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-5">
            <Field label="Fornecedor">
              <SelectField
                value={filtros.fornecedor}
                onChange={(v) => setFiltros({ ...filtros, fornecedor: v })}
                placeholder="Todos os fornecedores cadastrados"
                options={fornecedores}
              />
            </Field>
            <Field label="Status">
              <SelectField
                value={filtros.status}
                onChange={(v) => setFiltros({ ...filtros, status: v })}
                placeholder="Todos"
                options={["ativo", "inativo"]}
                labels={["Ativo", "Inativo"]}
              />
            </Field>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <button
              onClick={() => setModalFiltro(true)}
              className="flex items-center gap-2 text-sm text-[#0f2f52] border border-[#0f2f52] px-4 py-2 rounded-md hover:bg-blue-50 transition"
            >
              🔧 Filtros avançados
              {filtrosAtivos > 0 && (
                <span className="bg-[#0f2f52] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {filtrosAtivos}
                </span>
              )}
            </button>

            <div className="flex gap-3">
              {buscou && (
                <button
                  onClick={limparBusca}
                  className="px-5 py-2 border rounded-md text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  Limpar
                </button>
              )}
              <button
                onClick={() => buscar()}
                className="bg-[#0f2f52] text-white px-8 py-2 rounded-md text-sm hover:bg-[#1a4a7a] transition"
              >
                Buscar
              </button>
            </div>
          </div>
        </div>

        {/* TABELA DE RESULTADOS */}
        {buscou && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">
                Resultados
              </h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                {resultados.length} produto{resultados.length !== 1 ? "s" : ""}{" "}
                encontrado{resultados.length !== 1 ? "s" : ""}
              </span>
            </div>

            {resultados.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-5xl mb-3">🔍</p>
                <p className="text-gray-400 text-sm">
                  Nenhum produto encontrado para os filtros aplicados.
                </p>
                <button
                  onClick={limparBusca}
                  className="mt-4 text-[#0f2f52] text-sm underline"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 text-xs border-b bg-gray-50">
                      <th className="text-left px-6 py-3 font-medium">
                        Descrição
                      </th>
                      <th className="text-center px-4 py-3 font-medium">
                        Código
                      </th>
                      <th className="text-center px-4 py-3 font-medium">
                        Unidade
                      </th>
                      <th className="text-center px-4 py-3 font-medium">
                        Preço
                      </th>
                      <th className="text-center px-4 py-3 font-medium">
                        Estoque
                      </th>
                      <th className="text-center px-4 py-3 font-medium">
                        Status
                      </th>
                      <th className="text-center px-4 py-3 font-medium">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultados.map((p, i) => (
                      <tr
                        key={p.id}
                        className={`border-b last:border-0 hover:bg-blue-50/30 transition ${i % 2 === 1 ? "bg-gray-50/50" : ""}`}
                      >
                        <td className="px-6 py-3 text-gray-700 font-medium">
                          {p.nome}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-500 font-mono text-xs">
                          {p.sku}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-500">
                          {p.unidade}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600">
                          R$ {p.preco}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600">
                          {p.estoque}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge status={p.status} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => setModalEditar(p)}
                              className="flex items-center gap-1 bg-cyan-500 hover:bg-cyan-600 text-white text-xs px-3 py-1.5 rounded-md transition font-medium"
                            >
                              ✏️ Alterar
                            </button>
                            <button
                              onClick={() => setModalExcluir(p)}
                              className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-md transition font-medium"
                            >
                              🗑️ Excluir
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

      {/* ── MODAIS ── */}
      {modalFiltro && (
        <ModalFiltro
          filtros={filtros}
          onAplicar={(f) => {
            setFiltros(f);
            buscar(f);
          }}
          onClose={() => setModalFiltro(false)}
          secoes={secoes}
          fornecedores={fornecedores}
        />
      )}

      {modalEditar && (
        <ModalEdicao
          produto={modalEditar}
          onSalvar={salvarEdicao}
          onClose={() => setModalEditar(null)}
        />
      )}

      {modalExcluir && (
        <ModalExclusao
          produto={modalExcluir}
          onConfirmar={confirmarExclusao}
          onClose={() => setModalExcluir(null)}
        />
      )}

      {sucesso && (
        <ModalSucesso mensagem={sucesso} onClose={() => setSucesso(null)} />
      )}
    </div>
  );
}
