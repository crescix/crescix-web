"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";

/* TIPOS */
type SubItem = {
    label: string;
    href: string;
};

type MenuItem = {
    id: string;
    label: string;
    subItems: SubItem[];
};

/* Alterar nomes da navegação aqui, será mudado automaticamente no menu */
const menu: MenuItem[] = [
    {
        id: "negocio",
        label: "Meu Negócio",
        subItems: [{ label: "Dashboard", href: "/dashboard" }], /*Caso o caminho ficar diferente alterar aqui*/
    },
    {
        id: "cadastro",
        label: "Cadastro",
        subItems: [
            { label: "Fornecedores", href: "/cadastros/fornecedores" },
            { label: "Clientes", href: "/cadastro-cliente" },
            { label: "Produtos", href: "/cadastros/produtos" },
        ],
    },
    {
        id: "vendas",
        label: "Vendas",
        subItems: [
            { label: "Pedidos", href: "/vendas/pedidos" },
            { label: "Orçamentos", href: "/vendas/orcamentos" },
        ],
    },
    {
        id: "estoque",
        label: "Estoque",
        subItems: [
            { label: "Entradas", href: "/estoque/entradas" },
            { label: "Saídas", href: "/estoque/saidas" },
            { label: "Inventário", href: "/estoque/inventario" },
        ],
    },
    {
        id: "financeiro",
        label: "Financeiro",
        subItems: [
            { label: "Contas a Pagar", href: "/financeiro/pagar" },
            { label: "Contas a Receber", href: "/financeiro/receber" },
            { label: "Fluxo de Caixa", href: "/financeiro/fluxo-de-caixa" },
        ],
    },
];

export function Sidebar() {
    const [aberto, setAberto] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated, isAuthenticating } = useAuth()
    function toggle(id: string) {
        setAberto(aberto === id ? null : id);
    }


    if (!isAuthenticated || isAuthenticating ) return null;

    return (
        <header className="mt-6">
            <div className="mx-auto max-w-6xl rounded-xl border bg-white shadow-sm px-6">
                <div className="flex h-14 md:h-16 items-center">

                    <div className="flex items-center gap-3">
                        {/* Hamburger (mobile) */}
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="md:hidden p-2 rounded-lg hover:bg-zinc-100 transition"
                        >
                            ☰
                        </button>

                        {/* Logo seta */}
                        <Image
                            src="/images/Logo.png"
                            alt="Logo"
                            width={40}
                            height={40}
                            className="rounded-full object-cover border bg-[#508991] p-1"
                        />

                        {/* Título da página (mudar depois para aparecer o nome da página atual*/}
                        <span className="md:hidden text-sm font-semibold text-zinc-800">
                            Meu Negócio
                        </span>
                    </div>

                    {/* MENU DESKTOP */}
                    <nav className="relative hidden md:flex items-center gap-8 ml-8">
                        {menu.map((item) => (
                            <div key={item.id} className="relative">
                                <button
                                    onClick={() => toggle(item.id)}
                                    className="flex items-center gap-1 text-sm font-medium text-zinc-700 hover:text-zinc-900 transition"
                                >
                                    {item.label}
                                    <span
                                        className={`transition-transform ${aberto === item.id ? "rotate-180" : ""
                                            }`}
                                    >
                                        ▼
                                    </span>
                                </button>

                                {/* DROPDOWN */}
                                {aberto === item.id && (
                                    <ul className="absolute left-0 top-10 min-w-[200px] rounded-lg bg-white shadow-lg border p-2 space-y-1 z-50">
                                        {item.subItems.map((subItem) => (
                                            <li key={subItem.href}>
                                                <Link
                                                    href={subItem.href}
                                                    className="block rounded px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 transition"
                                                >
                                                    {subItem.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* PERFIL — MOBILE */}
                    <button className="md:hidden ml-auto p-2 rounded-full hover:bg-zinc-100 transition">
                        <img src="/LogoPerson.png" alt="Perfil" className="h-5 w-5" />
                    </button>

                    {/* ÍCONES — DESKTOP */}
                    <div className="hidden md:flex items-center gap-4 ml-auto">
                        <button className="p-2 rounded-full hover:bg-zinc-100 transition">
                            <img src="/LogoApps.png" alt="Apps" className="h-5 w-5" />
                        </button>

                        <button className="relative p-2 rounded-full hover:bg-zinc-100 transition">
                            <img
                                src="/LogoNotify.png"
                                alt="Notificações"
                                className="h-5 w-5"
                            />
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
                        </button>

                        <button className="p-2 rounded-full hover:bg-zinc-100 transition">
                            <img src="/LogoQuestion.png" alt="Ajuda" className="h-5 w-5" />
                        </button>

                        <button className="p-2 rounded-full hover:bg-zinc-100 transition">
                            <img src="/LogoPerson.png" alt="Perfil" className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* OVERLAY MOBILE */}
            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                />
            )}

            {/* MENU MOBILE (DRAWER) */}
            <div
                className={`
        fixed top-0 left-0 h-full w-72 bg-white z-50
        transform transition-transform duration-300
        md:hidden
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
    `}
            >
                {/* Header do menu */}
                <div className="flex items-center justify-between px-4 h-16 border-b">
                    <span className="font-semibold text-zinc-800">Menu</span>
                    <button onClick={() => setMobileOpen(false)} className="text-xl">
                        ✕
                    </button>
                </div>

                {/* Itens do menu */}
                <nav className="p-4 space-y-6">
                    {menu.map((item) => (
                        <div key={item.id}>
                            <p className="text-sm font-semibold text-zinc-500 mb-2">
                                {item.label}
                            </p>

                            <ul className="space-y-1">
                                {item.subItems.map((sub) => (
                                    <li key={sub.href}>
                                        <Link
                                            href={sub.href}
                                            onClick={() => setMobileOpen(false)}
                                            className="block rounded-lg px-3 py-2 text-zinc-700 hover:bg-zinc-100 transition"
                                        >
                                            {sub.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>
            </div>
        </header>
    );
}
