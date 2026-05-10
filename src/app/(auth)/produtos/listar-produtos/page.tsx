"use client";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Pencil, Trash2, CheckCircle2, AlertCircle, SlidersHorizontal, Package, ChevronLeft } from "lucide-react";

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

const SEED: Produto[] = [
{ id: 1, nome: "Camiseta Preta", sku: "0009820", unidade: "un", preco: "29,90", estoque: 52, status: "ativo", marca: "Marca A", secao: "Roupas", fornecedor: "Fornecedor A" },
{ id: 2, nome: "Calça Jeans Slim", sku: "0009821", unidade: "un", preco: "89,90", estoque: 18, status: "ativo", marca: "Marca B", secao: "Roupas", fornecedor: "Fornecedor B" },
{ id: 3, nome: "Tênis Branco", sku: "0009822", unidade: "par", preco: "149,90", estoque: 9, status: "ativo", marca: "Marca C", secao: "Calçados", fornecedor: "Fornecedor A" },
{ id: 4, nome: "Boné Azul", sku: "0009823", unidade: "un", preco: "39,90", estoque: 0, status: "inativo", marca: "Marca A", secao: "Acessórios", fornecedor: "Fornecedor C" },
{ id: 5, nome: "Meia Esportiva", sku: "0009824", unidade: "par", preco: "12,90", estoque: 120, status: "ativo", marca: "Marca D", secao: "Roupas", fornecedor: "Fornecedor B" },
{ id: 6, nome: "Jaqueta Cinza", sku: "0009825", unidade: "un", preco: "199,90", estoque: 7, status: "ativo", marca: "Marca B", secao: "Roupas", fornecedor: "Fornecedor A" },
{ id: 7, nome: "Shorts Verde", sku: "0009826", unidade: "un", preco: "49,90", estoque: 33, status: "inativo", marca: "Marca C", secao: "Roupas", fornecedor: "Fornecedor C" },
];

function getProdutosLS(): Produto[] | null {
try {
const raw = localStorage.getItem("produtos");
if (!raw) return null;
return JSON.parse(raw) as Produto[];
} catch { return null; }
}

function saveProdutosLS(lista: Produto[]) {
localStorage.setItem("produtos", JSON.stringify(lista));
}

function Badge({ status }: { status: string }) {
return (
<span className={`px-3 py-0.5 rounded-full text-xs font-semibold ${
    status === "ativo" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
}`}>
    {status === "ativo" ? "Ativo" : "Inativo"}
</span>
);
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
return (
<div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
    <div onClick={(e) => e.stopPropagation()}>{children}</div>
</div>
);
}

function Field({ label, children, className = "" }: { label: React.ReactNode; children: React.ReactNode; className?: string }) {
return (
<div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">{label}</label>
    {children}
</div>
);
}

const inputClass = "w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-cyan-500/50 text-sm transition-colors";
const selectClass = "w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 text-sm transition-colors cursor-pointer";

interface SelectFieldProps {
value: string;
onChange: (val: string) => void;
placeholder: string;
options?: string[];
labels?: string[];
}
function SelectField({ value, onChange, placeholder, options = [], labels }: SelectFieldProps) {
return (
<select value={value} title={placeholder} onChange={(e) => onChange(e.target.value)} className={selectClass}>
    <option value="" className="bg-[#0f2f52]">{placeholder}</option>
    {options.map((opt, i) => (
    <option key={opt} value={opt} className="bg-[#0f2f52]">{labels ? labels[i] : opt}</option>
    ))}
</select>
);
}

export interface Filtros {
busca: string;
secao: string;
fornecedor: string;
status: string;
}

/* ─── MODAL FILTRO AVANÇADO ─── */
interface ModalFiltroProps {
filtros: Filtros;
onAplicar: (f: Filtros) => void;
onClose: () => void;
secoes: string[];
fornecedores: string[];
}
function ModalFiltro({ filtros, onAplicar, onClose, secoes, fornecedores }: ModalFiltroProps) {
const [local, setLocal] = useState<Filtros>({ ...filtros });

function aplicar() { onAplicar(local); onClose(); }
function limpar() { onAplicar({ busca: "", secao: "", fornecedor: "", status: "" }); onClose(); }

return (
<Overlay onClose={onClose}>
    <div className="bg-primary rounded-2xl border border-white/10 w-full max-w-lg">
    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <SlidersHorizontal className="h-3 w-3" />
        </span>
        <h2 className="text-base font-bold text-white">Filtros Avançados</h2>
        </div>
        <button onClick={onClose} className="text-white/30 hover:text-white/70 transition">
        <X className="h-5 w-5" />
        </button>
    </div>

    <div className="px-6 py-5 grid gap-4">
        <Field label="Nome ou Código">
        <input value={local.busca} onChange={(e) => setLocal({ ...local, busca: e.target.value })}
            placeholder="Busca por Nome ou Código" className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
        <Field label="Seção">
            <SelectField value={local.secao} onChange={(v) => setLocal({ ...local, secao: v })}
            placeholder="Todas as seções" options={secoes} />
        </Field>
        <Field label="Status">
            <SelectField value={local.status} onChange={(v) => setLocal({ ...local, status: v })}
            placeholder="Todos" options={["ativo", "inativo"]} labels={["Ativo", "Inativo"]} />
        </Field>
        </div>
        <Field label="Fornecedor">
        <SelectField value={local.fornecedor} onChange={(v) => setLocal({ ...local, fornecedor: v })}
            placeholder="Todos os fornecedores" options={fornecedores} />
        </Field>
    </div>

    <div className="flex gap-3 px-6 pb-5 justify-end">
        <button onClick={limpar}
        className="px-5 h-10 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 text-sm font-semibold transition-all active:scale-95">
        Limpar Filtros
        </button>
        <button onClick={aplicar}
        className="px-6 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-bold transition-all active:scale-95">
        Aplicar
        </button>
    </div>
    </div>
</Overlay>
);
}

/* ─── MODAL EDIÇÃO ─── */
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
    <div className="bg-primary rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-primary z-10">
        <div className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Pencil className="h-3 w-3" />
        </span>
        <h2 className="text-base font-bold text-white">Editar Produto</h2>
        </div>
        <button onClick={onClose} className="text-white/30 hover:text-white/70 transition">
        <X className="h-5 w-5" />
        </button>
    </div>

    <div className="px-6 py-5 grid md:grid-cols-2 gap-4">
        <Field label="Nome *" className="md:col-span-2">
        <Input name="nome" value={form.nome || ""} onChange={ch} className={inputClass} />
        </Field>
        <Field label="SKU / Código">
        <Input name="sku" value={form.sku || ""} onChange={ch} className={inputClass} />
        </Field>
        <Field label="Preço de Venda">
        <Input name="preco" value={form.preco || ""} onChange={ch} className={inputClass} />
        </Field>
        <Field label="Unidade">
        <Input name="unidade" value={form.unidade || ""} onChange={ch} className={inputClass} />
        </Field>
        <Field label="Estoque">
        <Input name="estoque" type="number" value={form.estoque || ""} onChange={ch} className={inputClass} />
        </Field>
        <Field label="Marca">
        <Input name="marca" value={form.marca || ""} onChange={ch} className={inputClass} />
        </Field>
        <Field label="Seção">
        <Input name="secao" value={form.secao || ""} onChange={ch} className={inputClass} />
        </Field>
        <Field label="Fornecedor">
        <Input name="fornecedor" value={form.fornecedor || ""} onChange={ch} className={inputClass} />
        </Field>
        <Field label="Status">
        <select name="status" title="Status do produto" value={form.status || "ativo"} onChange={ch} className={selectClass}>
            <option value="ativo" className="bg-[#0f2f52]">Ativo</option>
            <option value="inativo" className="bg-[#0f2f52]">Inativo</option>
        </select>
        </Field>
    </div>

    <div className="flex gap-3 px-6 pb-5 justify-end border-t border-white/10 pt-4">
        <button onClick={onClose}
        className="px-5 h-10 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 text-sm font-semibold transition-all active:scale-95">
        Cancelar
        </button>
        <button onClick={() => onSalvar(form)}
        className="px-6 h-10 rounded-xl bg-green-500 hover:bg-green-400 text-white text-sm font-bold transition-all active:scale-95">
        Salvar Alterações
        </button>
    </div>
    </div>
</Overlay>
);
}

/* ─── MODAL EXCLUSÃO ─── */
interface ModalExclusaoProps {
produto: Produto;
onConfirmar: () => void;
onClose: () => void;
}
function ModalExclusao({ produto, onConfirmar, onClose }: ModalExclusaoProps) {
return (
<Overlay onClose={onClose}>
    <div className="bg-primary rounded-2xl border border-red-500/30 w-full max-w-sm p-6 space-y-4 text-center">
    <div className="flex justify-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertCircle className="h-6 w-6 text-red-400" />
        </div>
    </div>
    <h2 className="font-bold text-white text-lg">Excluir produto?</h2>
    <p className="text-sm text-white/50">
        Tem certeza que deseja excluir{" "}
        <span className="font-semibold text-white">{produto?.nome}</span>?{" "}
        Esta ação não pode ser desfeita.
    </p>
    <div className="flex gap-3 pt-2">
        <button onClick={onClose}
        className="flex-1 h-10 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 text-sm font-semibold transition-all active:scale-95">
        Cancelar
        </button>
        <button onClick={onConfirmar}
        className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-bold transition-all active:scale-95">
        Sim, excluir
        </button>
    </div>
    </div>
</Overlay>
);
}

/* ─── MODAL SUCESSO ─── */
function ModalSucesso({ mensagem, onClose }: { mensagem: string; onClose: () => void }) {
useEffect(() => {
const t = setTimeout(onClose, 2000);
return () => clearTimeout(t);
}, []);

return (
<Overlay onClose={onClose}>
    <div className="bg-primary rounded-2xl border border-white/10 w-full max-w-xs p-6 space-y-4 text-center">
    <div className="flex justify-center">
        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
        <CheckCircle2 className="h-6 w-6 text-green-400" />
        </div>
    </div>
    <h2 className="font-bold text-white text-base">{mensagem}</h2>
    <p className="text-xs text-white/30">Fechando automaticamente…</p>
    </div>
</Overlay>
);
}

/* ─── PÁGINA PRINCIPAL ─── */
export default function ListaProdutos() {
const router = useRouter();

const [todos, setTodos] = useState<Produto[]>([]);
const [resultados, setResultados] = useState<Produto[]>([]);
const [buscou, setBuscou] = useState<boolean>(false);
const [filtros, setFiltros] = useState<Filtros>({ busca: "", secao: "", fornecedor: "", status: "ativo" });
const [modalFiltro, setModalFiltro] = useState<boolean>(false);
const [modalEditar, setModalEditar] = useState<Produto | null>(null);
const [modalExcluir, setModalExcluir] = useState<Produto | null>(null);
const [sucesso, setSucesso] = useState<string | null>(null);

useEffect(() => {
let lista = getProdutosLS();
if (!lista || lista.length === 0) { saveProdutosLS(SEED); lista = SEED; }
setTodos(lista);
}, []);

function atualizarTodos(nova: Produto[]) { saveProdutosLS(nova); setTodos(nova); }

function buscar(f: Filtros = filtros) {
const lista = getProdutosLS() || [];
const r = lista.filter((p) => {
    const mBusca = !f.busca || p.nome?.toLowerCase().includes(f.busca.toLowerCase()) || p.sku?.includes(f.busca);
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

function salvarEdicao(atualizado: Produto) {
const nova = todos.map((p) => (p.id === atualizado.id ? atualizado : p));
atualizarTodos(nova);
setResultados((prev) => prev.map((p) => (p.id === atualizado.id ? atualizado : p)));
setModalEditar(null);
setSucesso("Produto atualizado com sucesso!");
}

function confirmarExclusao() {
if (!modalExcluir) return;
const nova = todos.filter((p) => p.id !== modalExcluir.id);
atualizarTodos(nova);
setResultados((prev) => prev.filter((p) => p.id !== modalExcluir.id));
setModalExcluir(null);
setSucesso("Produto excluído com sucesso!");
}

const secoes = Array.from(new Set(todos.map((p) => p.secao).filter(Boolean)));
const fornecedores = Array.from(new Set(todos.map((p) => p.fornecedor).filter(Boolean)));
const filtrosAtivos = [filtros.busca, filtros.secao, filtros.fornecedor, filtros.status].filter(Boolean).length;

return (
<div className="w-full min-h-screen bg-secondary p-4 md:p-8 flex flex-col items-center">
    <div className="w-full max-w-5xl space-y-6">

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
            Cadastros / Produtos
            </p>
            <h1 className="text-3xl font-black text-white tracking-tighter">
            Filtro de Produtos
            </h1>
        </div>
        </div>
        <a href="/produtos/cadastro"
        className="flex items-center gap-2 px-5 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-bold transition-all active:scale-95">
        + Incluir Cadastro
        </a>
    </div>

    {/* Painel de Filtro */}
    <div className="bg-primary rounded-2xl border border-white/10 p-6 space-y-5">
        <div className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Search className="h-3 w-3" />
        </span>
        <h2 className="text-base font-bold text-white">Buscar Produtos</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
        <Field label={<>Nome ou Código <span className="text-red-400">*</span></>}>
            <input value={filtros.busca}
            onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && buscar()}
            placeholder="Busca por Nome ou Código" className={inputClass} />
        </Field>
        <Field label="Seção">
            <SelectField value={filtros.secao} onChange={(v) => setFiltros({ ...filtros, secao: v })}
            placeholder="Todas as seções" options={secoes} />
        </Field>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
        <Field label="Fornecedor">
            <SelectField value={filtros.fornecedor} onChange={(v) => setFiltros({ ...filtros, fornecedor: v })}
            placeholder="Todos os fornecedores" options={fornecedores} />
        </Field>
        <Field label="Status">
            <SelectField value={filtros.status} onChange={(v) => setFiltros({ ...filtros, status: v })}
            placeholder="Todos" options={["ativo", "inativo"]} labels={["Ativo", "Inativo"]} />
        </Field>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
        <button onClick={() => setModalFiltro(true)}
            className="flex items-center gap-2 px-4 h-10 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 text-sm font-semibold transition-all active:scale-95">
            <SlidersHorizontal className="h-4 w-4" />
            Filtros avançados
            {filtrosAtivos > 0 && (
            <span className="bg-cyan-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {filtrosAtivos}
            </span>
            )}
        </button>

        <div className="flex gap-3">
            {buscou && (
            <button onClick={limparBusca}
                className="flex items-center gap-2 px-5 h-10 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 text-sm font-semibold transition-all active:scale-95">
                <X className="h-4 w-4" /> Limpar
            </button>
            )}
            <button onClick={() => buscar()}
            className="flex items-center gap-2 px-6 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-bold transition-all active:scale-95">
            <Search className="h-4 w-4" /> Buscar
            </button>
        </div>
        </div>
    </div>

    {/* Tabela de Resultados */}
    {buscou && (
        <div className="bg-primary rounded-2xl border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Package className="h-3 w-3" />
            </span>
            <h2 className="text-base font-bold text-white">Resultados</h2>
            </div>
            <span className="text-white/40 text-xs">
            {resultados.length} produto{resultados.length !== 1 ? "s" : ""} encontrado{resultados.length !== 1 ? "s" : ""}
            </span>
        </div>

        {resultados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Package className="h-8 w-8 text-white/15" />
            <p className="text-white/30 text-sm">Nenhum produto encontrado para os filtros aplicados.</p>
            <button onClick={limparBusca} className="text-cyan-400 text-sm hover:underline">Limpar filtros</button>
            </div>
        ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                <tr className="bg-white/5 border-b border-white/10">
                    <th className="text-white/40 text-xs font-semibold text-left px-6 py-3">Descrição</th>
                    <th className="text-white/40 text-xs font-semibold text-center px-4 py-3">Código</th>
                    <th className="text-white/40 text-xs font-semibold text-center px-4 py-3">Unidade</th>
                    <th className="text-white/40 text-xs font-semibold text-center px-4 py-3">Preço</th>
                    <th className="text-white/40 text-xs font-semibold text-center px-4 py-3">Estoque</th>
                    <th className="text-white/40 text-xs font-semibold text-center px-4 py-3">Status</th>
                    <th className="text-white/40 text-xs font-semibold text-center px-6 py-3">Ações</th>
                </tr>
                </thead>
                <tbody>
                {resultados.map((p) => (
                    <tr key={p.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{p.nome}</td>
                    <td className="px-4 py-4 text-center text-white/40 font-mono text-xs">{p.sku}</td>
                    <td className="px-4 py-4 text-center text-white/70">{p.unidade}</td>
                    <td className="px-4 py-4 text-center text-white/70">R$ {p.preco}</td>
                    <td className="px-4 py-4 text-center text-white/70">{p.estoque}</td>
                    <td className="px-4 py-4 text-center"><Badge status={p.status} /></td>
                    <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center">
                        <button onClick={() => setModalEditar(p)}
                            className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold transition-all active:scale-95">
                            <Pencil className="h-3 w-3" /> Alterar
                        </button>
                        <button onClick={() => setModalExcluir(p)}
                            className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-all active:scale-95">
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

    {modalFiltro && (
    <ModalFiltro filtros={filtros} onAplicar={(f) => { setFiltros(f); buscar(f); }}
        onClose={() => setModalFiltro(false)} secoes={secoes} fornecedores={fornecedores} />
    )}
    {modalEditar && (
    <ModalEdicao produto={modalEditar} onSalvar={salvarEdicao} onClose={() => setModalEditar(null)} />
    )}
    {modalExcluir && (
    <ModalExclusao produto={modalExcluir} onConfirmar={confirmarExclusao} onClose={() => setModalExcluir(null)} />
    )}
    {sucesso && (
    <ModalSucesso mensagem={sucesso} onClose={() => setSucesso(null)} />
    )}
</div>
);
}