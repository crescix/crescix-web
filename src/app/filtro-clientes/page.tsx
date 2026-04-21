"use client";

import { useState } from "react";

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
    {
    id: 123,
    cpf: "123.456.789-10",
    nome: "Ana Silva",
    telefone: "(11) 2222-3333",
    status: "ativo",
    },
    {
    id: 456,
    cpf: "987.654.321-00",
    nome: "Bruno Souza",
    telefone: "(21) 4444-5555",
    status: "inativo",
    },
    {
    id: 789,
    cpf: "111.222.333-44",
    nome: "Ana Paula",
    telefone: "(11) 9999-8888",
    status: "ativo",
    },
];

localStorage.setItem("clientes", JSON.stringify(mock));
return mock;
});

const [resultado, setResultado] = useState<Cliente[]>([]);
const [modalEditar, setModalEditar] = useState(false);
const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
const [modalExcluir, setModalExcluir] =
useState<"confirmar" | "final" | null>(null);
const [clienteParaExcluir, setClienteParaExcluir] =
useState<Cliente | null>(null);

/* 
    FILTRO
 */
function buscarClientes(e: React.FormEvent) {
e.preventDefault();

const nome = (
    document.getElementById("nome") as HTMLInputElement
).value.toLowerCase();

const cpf = (document.getElementById("cpf") as HTMLInputElement).value;

const situacao = (
    document.getElementById("situacao") as HTMLSelectElement
).value;

const filtrados = clientes.filter((cliente) => {
    const matchNome =
    nome === "" ||
    cliente.nome.toLowerCase().includes(nome) ||
    cliente.id.toString().includes(nome);

    const matchCpf = cpf === "" || cliente.cpf.includes(cpf);
    const matchStatus = situacao === "" || cliente.status === situacao;

    return matchNome && matchCpf && matchStatus;
});

setResultado(filtrados);
}

function limparFiltros() {
setResultado([]);
}

/* 
    EDITAR
 */
function salvarAlteracao(e: React.FormEvent) {
e.preventDefault();
if (!clienteEditando) return;

const atualizados = clientes.map((c) =>
    c.id === clienteEditando.id ? clienteEditando : c
);

setClientes(atualizados);
setResultado(atualizados);
localStorage.setItem("clientes", JSON.stringify(atualizados));

setModalEditar(false);
setClienteEditando(null);
}

/* 
    EXCLUIR
 */
const abrirModalExcluir = (cliente: Cliente) => {
setClienteParaExcluir(cliente);
setModalExcluir("confirmar");
};

const excluirClienteDefinitivo = () => {
if (!clienteParaExcluir) return;

const atualizados = clientes.filter(
    (c) => c.id !== clienteParaExcluir.id
);

setClientes(atualizados);
setResultado(atualizados);
localStorage.setItem("clientes", JSON.stringify(atualizados));

setModalExcluir(null);
setClienteParaExcluir(null);
};

return (
<main className="min-h-screen bg-[#508991] p-10 font-sans">
    {/* FILTRO */}
    <div className="max-w-4xl mx-auto bg-[#092542] p-8 rounded-2xl">
    <h2 className="text-center text-3xl font-bold text-white mb-8">
        Filtro de cliente
    </h2>

    <form onSubmit={buscarClientes} className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
        <input
            id="nome"
            placeholder="Busca por Nome ou Código"
            className="w-full h-10 px-3 rounded-lg bg-[#0f2f52] text-white border border-[#1e3a5f]"
        />

        <input
            id="cpf"
            placeholder="000.000.000-00"
            className="w-full h-10 px-3 rounded-lg bg-[#0f2f52] text-white border border-[#1e3a5f]"
        />
        </div>

        <select
        id="situacao"
        className="w-full h-10 px-3 rounded-lg bg-[#0f2f52] text-white border border-[#1e3a5f]"
        >
        <option value="">Todos</option>
        <option value="ativo">Ativo</option>
        <option value="inativo">Inativo</option>
        </select>

        <div className="flex justify-end gap-4">
        <button
            type="button"
            onClick={limparFiltros}
            className="px-6 h-11 rounded-full bg-[#508991] text-white font-bold"
        >
            Limpar
        </button>

        <button
            type="submit"
            className="px-6 h-11 rounded-full bg-[#508991] text-white font-bold"
        >
            Buscar
        </button>
        </div>
    </form>
    </div>

    {/* RESULTADOS */}
    {resultado.length > 0 && (
    <div className="max-w-6xl mx-auto mt-14">
        <table className="w-full bg-[#092542] text-white text-center rounded-2xl overflow-hidden">
        <thead className="bg-[#0f2f52] text-blue-200 text-sm">
            <tr>
            <th className="py-4">Código</th>
            <th>CPF</th>
            <th>Nome</th>
            <th>Telefone</th>
            <th>Status</th>
            <th>Ações</th>
            </tr>
        </thead>

        <tbody>
            {resultado.map((cliente) => (
            <tr key={cliente.id} className="border-t border-[#1e3a5f]">
                <td className="py-4">{cliente.id}</td>
                <td>{cliente.cpf}</td>
                <td>{cliente.nome}</td>
                <td>{cliente.telefone}</td>
                <td>
                <span
                    className={`px-4 py-1 rounded-full text-xs font-semibold uppercase ${
                    cliente.status === "ativo"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                >
                    {cliente.status}
                </span>
                </td>

                <td className="flex justify-center gap-3 py-4">
                <button
                    onClick={() => {
                    setClienteEditando(cliente);
                    setModalEditar(true);
                    }}
                    className="px-4 h-9 rounded-full bg-[#508991] text-white text-sm font-semibold"
                >
                    Alterar
                </button>

                <button
                    onClick={() => abrirModalExcluir(cliente)}
                    className="px-4 h-9 rounded-full bg-red-600 hover:bg-red-800 text-white text-sm font-semibold"
                >
                    Excluir
                </button>
                </td>
            </tr>
            ))}
        </tbody>
        </table>
    </div>
    )}

    {/* MODAL EDITAR */}
    {modalEditar && clienteEditando && (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-[#092542] w-[500px] max-w-[90%] p-8 rounded-2xl text-white">
        <h2 className="text-center text-xl font-bold mb-6">
            Alterar Cliente
        </h2>

        <form onSubmit={salvarAlteracao} className="space-y-4">
            <input
            value={clienteEditando.nome}
            onChange={(e) =>
                setClienteEditando({
                ...clienteEditando,
                nome: e.target.value,
                })
            }
            className="w-full h-10 px-3 rounded-lg bg-[#0f2f52] border border-[#1e3a5f]"
            />

            <input
            value={clienteEditando.cpf}
            onChange={(e) =>
                setClienteEditando({
                ...clienteEditando,
                cpf: e.target.value,
                })
            }
            className="w-full h-10 px-3 rounded-lg bg-[#0f2f52] border border-[#1e3a5f]"
            />

            <div className="flex justify-end gap-3 mt-4">
            <button
                type="button"
                onClick={() => setModalEditar(false)}
                className="px-4 py-2 rounded-full bg-[#0f2f52]"
            >
                Cancelar
            </button>

            <button
                type="submit"
                className="px-4 py-2 rounded-full bg-[#508991]"
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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-[#092542] w-[420px] max-w-[90%] p-7 rounded-2xl border-2 border-red-600 text-white">
        {modalExcluir === "confirmar" && (
            <>
            <h2 className="text-center text-red-400 text-xl font-bold mb-4">
                Confirmar exclusão?
            </h2>

            <p className="text-center mb-6">
                Deseja excluir <strong>{clienteParaExcluir.nome}</strong>?
            </p>

            <div className="flex justify-end gap-3">
                <button
                onClick={() => setModalExcluir(null)}
                className="px-4 py-2 rounded-full bg-[#0f2f52]"
                >
                Cancelar
                </button>

                <button
                onClick={() => setModalExcluir("final")}
                className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-800"
                >
                Excluir
                </button>
            </div>
            </>
        )}

        {modalExcluir === "final" && (
            <>
            <h2 className="text-center text-red-400 text-xl font-bold mb-4">
                CONFIRMAÇÃO FINAL
            </h2>

            <p className="text-center mb-6">
                Tem certeza absoluta?
            </p>

            <div className="flex justify-end gap-3">
                <button
                onClick={() => setModalExcluir("confirmar")}
                className="px-4 py-2 rounded-full bg-[#0f2f52]"
                >
                Voltar
                </button>

                <button
                onClick={excluirClienteDefinitivo}
                className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-800"
                >
                Sim, excluir
                </button>
            </div>
            </>
        )}
        </div>
    </div>
    )}
</main>
);
}
