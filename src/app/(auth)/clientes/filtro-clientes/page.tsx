"use client";

import { useState } from "react";
import { Search, X, Pencil, Trash2, AlertCircle, Users } from "lucide-react";

type Cliente = {
id: number;
cpf: string;
nome: string;
telefone: string;
status: "ativo" | "inativo";
};

export default function Clientes() {
const [clientes, setClientes] = useState<Cliente[]>(() => {
if (typeof window === "undefined") return [];

const dados = localStorage.getItem("clientes");
if (dados) return JSON.parse(dados);

const mock: Cliente[] = [
{ id: 123, cpf: "123.456.789-10", nome: "Ana Silva", telefone: "(11) 2222-3333", status: "ativo" },
{ id: 456, cpf: "987.654.321-00", nome: "Bruno Souza", telefone: "(21) 4444-5555", status: "inativo" },
{ id: 789, cpf: "111.222.333-44", nome: "Ana Paula", telefone: "(11) 9999-8888", status: "ativo" },
];

localStorage.setItem("clientes", JSON.stringify(mock));
return mock;
});

const [resultado, setResultado] = useState<Cliente[]>([]);
const [buscou, setBuscou] = useState(false);
const [modalEditar, setModalEditar] = useState(false);
const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
const [modalExcluir, setModalExcluir] = useState<"confirmar" | "final" | null>(null);
const [clienteParaExcluir, setClienteParaExcluir] = useState<Cliente | null>(null);

function buscarClientes(e: React.FormEvent) {
e.preventDefault();
const nome = (document.getElementById("nome") as HTMLInputElement).value.toLowerCase();
const cpf = (document.getElementById("cpf") as HTMLInputElement).value;
const situacao = (document.getElementById("situacao") as HTMLSelectElement).value;

const filtrados = clientes.filter((cliente) => {
const matchNome = nome === "" || cliente.nome.toLowerCase().includes(nome) || cliente.id.toString().includes(nome);
const matchCpf = cpf === "" || cliente.cpf.includes(cpf);
const matchStatus = situacao === "" || cliente.status === situacao;
return matchNome && matchCpf && matchStatus;
});

setResultado(filtrados);
setBuscou(true);
}

function limparFiltros() {
setResultado([]);
setBuscou(false);
(document.getElementById("nome") as HTMLInputElement).value = "";
(document.getElementById("cpf") as HTMLInputElement).value = "";
(document.getElementById("situacao") as HTMLSelectElement).value = "";
}

function salvarAlteracao(e: React.FormEvent) {
e.preventDefault();
if (!clienteEditando) return;

const atualizados = clientes.map((c) => c.id === clienteEditando.id ? clienteEditando : c);
setClientes(atualizados);
setResultado(atualizados);
localStorage.setItem("clientes", JSON.stringify(atualizados));
setModalEditar(false);
setClienteEditando(null);
}

const abrirModalExcluir = (cliente: Cliente) => {
setClienteParaExcluir(cliente);
setModalExcluir("confirmar");
};

const excluirClienteDefinitivo = () => {
if (!clienteParaExcluir) return;
const atualizados = clientes.filter((c) => c.id !== clienteParaExcluir.id);
setClientes(atualizados);
setResultado(atualizados);
localStorage.setItem("clientes", JSON.stringify(atualizados));
setModalExcluir(null);
setClienteParaExcluir(null);
};

return (
<div className="w-full min-h-screen bg-secondary p-4 md:p-8 flex flex-col items-center">
<div className="w-full max-w-5xl space-y-6">

{/* Header */}
<div>
    <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-1">
    Cadastros / Clientes
    </p>
    <h1 className="text-3xl font-black text-white tracking-tighter">
    Filtro de Clientes
    </h1>
</div>

{/* Card de Filtro */}
<div className="bg-primary rounded-2xl border border-white/10 p-6 space-y-5">
    <div className="flex items-center gap-3">
    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">
        <Search className="h-3 w-3" />
    </span>
    <h2 className="text-base font-bold text-white">Buscar clientes</h2>
    </div>

    <form onSubmit={buscarClientes} className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
        <label className="text-white/50 text-xs font-medium">Nome ou Código</label>
        <input
            id="nome"
            placeholder="Busca por nome ou código"
            className="w-full h-10 px-3 rounded-lg bg-white/5 text-white border border-white/10 placeholder:text-white/25 focus:outline-none focus:border-cyan-500/50 text-sm transition-colors"
        />
        </div>

        <div className="space-y-1.5">
        <label className="text-white/50 text-xs font-medium">CPF</label>
        <input
            id="cpf"
            placeholder="000.000.000-00"
            className="w-full h-10 px-3 rounded-lg bg-white/5 text-white border border-white/10 placeholder:text-white/25 focus:outline-none focus:border-cyan-500/50 text-sm transition-colors"
        />
        </div>
    </div>

    <div className="space-y-1.5">
        <label className="text-white/50 text-xs font-medium">Situação</label>
        <select
        id="situacao"
        className="w-full h-10 px-3 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-cyan-500/50 text-sm transition-colors"
        >
        <option value="" className="bg-[#0f2f52]">Todos</option>
        <option value="ativo" className="bg-[#0f2f52]">Ativo</option>
        <option value="inativo" className="bg-[#0f2f52]">Inativo</option>
        </select>
    </div>

    <div className="flex justify-end gap-3 pt-1">
        <button
        type="button"
        onClick={limparFiltros}
        className="flex items-center gap-2 px-5 h-10 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 text-sm font-semibold transition-all active:scale-95"
        >
        <X className="h-4 w-4" />
        Limpar
        </button>

        <button
        type="submit"
        className="flex items-center gap-2 px-6 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-bold transition-all active:scale-95"
        >
        <Search className="h-4 w-4" />
        Buscar
        </button>
    </div>
    </form>
</div>

{/* Resultados */}
{buscou && (
    <div className="bg-primary rounded-2xl border border-white/10 overflow-hidden">
    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">
            <Users className="h-3 w-3" />
        </span>
        <h2 className="text-base font-bold text-white">Resultados</h2>
        </div>
        <span className="text-white/40 text-xs">
        {resultado.length} {resultado.length === 1 ? "cliente encontrado" : "clientes encontrados"}
        </span>
    </div>

    {resultado.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Users className="h-8 w-8 text-white/15" />
        <p className="text-white/30 text-sm">Nenhum cliente encontrado</p>
        </div>
    ) : (
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
            <thead>
            <tr className="bg-white/5 border-b border-white/10">
                <th className="text-white/40 text-xs font-semibold text-left px-6 py-3">Código</th>
                <th className="text-white/40 text-xs font-semibold text-left px-4 py-3">CPF</th>
                <th className="text-white/40 text-xs font-semibold text-left px-4 py-3">Nome</th>
                <th className="text-white/40 text-xs font-semibold text-left px-4 py-3">Telefone</th>
                <th className="text-white/40 text-xs font-semibold text-center px-4 py-3">Status</th>
                <th className="text-white/40 text-xs font-semibold text-center px-6 py-3">Ações</th>
            </tr>
            </thead>
            <tbody>
            {resultado.map((cliente) => (
                <tr key={cliente.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-white/40 font-mono text-xs">{cliente.id}</td>
                <td className="px-4 py-4 text-white/70">{cliente.cpf}</td>
                <td className="px-4 py-4 text-white font-medium">{cliente.nome}</td>
                <td className="px-4 py-4 text-white/70">{cliente.telefone}</td>
                <td className="px-4 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                    cliente.status === "ativo"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}>
                    {cliente.status}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                    <button
                        onClick={() => { setClienteEditando(cliente); setModalEditar(true); }}
                        className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold transition-all active:scale-95"
                    >
                        <Pencil className="h-3 w-3" />
                        Alterar
                    </button>
                    <button
                        onClick={() => abrirModalExcluir(cliente)}
                        className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-all active:scale-95"
                    >
                        <Trash2 className="h-3 w-3" />
                        Excluir
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

{/* MODAL EDITAR */}
{modalEditar && clienteEditando && (
<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div className="bg-primary w-full max-w-md rounded-2xl border border-white/10 p-6 space-y-5">
    <div className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
        <Pencil className="h-3 w-3" />
        </span>
        <h2 className="text-base font-bold text-white">Alterar Cliente</h2>
    </div>

    <form onSubmit={salvarAlteracao} className="space-y-4">
        <div className="space-y-1.5">
        <label className="text-white/50 text-xs font-medium">Nome</label>
        <input
            value={clienteEditando.nome}
            onChange={(e) => setClienteEditando({ ...clienteEditando, nome: e.target.value })}
            className="w-full h-10 px-3 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-cyan-500/50 text-sm transition-colors"
        />
        </div>

        <div className="space-y-1.5">
        <label className="text-white/50 text-xs font-medium">CPF</label>
        <input
            value={clienteEditando.cpf}
            onChange={(e) => setClienteEditando({ ...clienteEditando, cpf: e.target.value })}
            className="w-full h-10 px-3 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-cyan-500/50 text-sm transition-colors"
        />
        </div>

        <div className="space-y-1.5">
        <label className="text-white/50 text-xs font-medium">Telefone</label>
        <input
            value={clienteEditando.telefone}
            onChange={(e) => setClienteEditando({ ...clienteEditando, telefone: e.target.value })}
            className="w-full h-10 px-3 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-cyan-500/50 text-sm transition-colors"
        />
        </div>

        <div className="space-y-1.5">
        <label className="text-white/50 text-xs font-medium">Status</label>
        <select
            value={clienteEditando.status}
            onChange={(e) => setClienteEditando({ ...clienteEditando, status: e.target.value as "ativo" | "inativo" })}
            className="w-full h-10 px-3 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-cyan-500/50 text-sm transition-colors"
        >
            <option value="ativo" className="bg-[#0f2f52]">Ativo</option>
            <option value="inativo" className="bg-[#0f2f52]">Inativo</option>
        </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
        <button
            type="button"
            onClick={() => setModalEditar(false)}
            className="px-5 h-10 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 text-sm font-semibold transition-all active:scale-95"
        >
            Cancelar
        </button>
        <button
            type="submit"
            className="px-6 h-10 rounded-xl bg-green-500 hover:bg-green-400 text-white text-sm font-bold transition-all active:scale-95"
        >
            Salvar
        </button>
        </div>
    </form>
    </div>
</div>
)}

{/* MODAL EXCLUIR */}
{modalExcluir && clienteParaExcluir && (
<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
    <div className="bg-primary w-full max-w-sm rounded-2xl border border-red-500/30 p-6 space-y-4">
    <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertCircle className="h-6 w-6 text-red-400" />
        </div>

        {modalExcluir === "confirmar" ? (
        <>
            <h2 className="text-white font-bold text-lg">Excluir cliente?</h2>
            <p className="text-white/50 text-sm">
            Deseja excluir <span className="text-white font-semibold">{clienteParaExcluir.nome}</span>? Esta ação não pode ser desfeita.
            </p>
        </>
        ) : (
        <>
            <h2 className="text-red-400 font-bold text-lg">Confirmação Final</h2>
            <p className="text-white/50 text-sm">
            Tem certeza absoluta que deseja excluir este cliente?
            </p>
        </>
        )}
    </div>

    <div className="flex gap-3 pt-2">
        <button
        onClick={() => modalExcluir === "confirmar" ? setModalExcluir(null) : setModalExcluir("confirmar")}
        className="flex-1 h-10 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 text-sm font-semibold transition-all active:scale-95"
        >
        {modalExcluir === "confirmar" ? "Cancelar" : "Voltar"}
        </button>
        <button
        onClick={() => modalExcluir === "confirmar" ? setModalExcluir("final") : excluirClienteDefinitivo()}
        className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-bold transition-all active:scale-95"
        >
        {modalExcluir === "confirmar" ? "Excluir" : "Sim, excluir"}
        </button>
    </div>
    </div>
</div>
)}
</div>
);
}