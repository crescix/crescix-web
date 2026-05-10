"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { 
  ChevronDown, 
  Menu, 
  X, 
  Bell, 
  HelpCircle, 
  User, 
  Grid3X3 
} from "lucide-react";

type SubItem = {
  label: string;
  href: string;
};

type SubGroup = {
  group: string;
  items: SubItem[];
};

type MenuItem = {
  id: string;
  label: string;
  subGroups?: SubGroup[];
  subItems?: SubItem[];
};

const menu: MenuItem[] = [
  {
    id: "negocio",
    label: "Meu Negócio",
    subItems: [{ label: "Dashboard", href: "/dashboard" }],
  },
  {
    id: "cadastro",
    label: "Cadastros",
    subGroups: [
      {
        group: "Fornecedores",
        items: [
          { label: "Cadastro", href: "/fornecedores/cadastro" },
          { label: "Filtro", href: "/fornecedores/filtro" },
        ],
      },
      {
        group: "Clientes",
        items: [
          { label: "Cadastro", href: "/clientes/cadastro" },
          { label: "Filtro", href: "/clientes/filtro-clientes" },
        ],
      },
      {
        group: "Produtos",
        items: [
          { label: "Cadastro", href: "/produtos/cadastro" },
        ],
      },
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
      { label: "Fluxo de Caixa", href: "/fluxo-de-caixa" },
    ],
  },
];

export function Navbar() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, isAuthenticating } = useAuth();

  if (!isAuthenticated || isAuthenticating) return null;

  const toggleDropdown = (id: string) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  return (
    <header className="sticky top-0 z-50 mt-6">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex h-16 items-center px-6">
            
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#508991] flex-shrink-0">
                <img 
                  src="/Logo.png"           
                  alt="Logo do Meu Negócio"
                  className="h-[29px] w-[48.33px] object-contain"
                  style={{ opacity: 1 }}
                />
              </div>
            </div>

            {/* Menu Desktop */}
            <nav className="hidden md:flex items-center gap-8 ml-12">
              {menu.map((item) => (
                <div key={item.id} className="relative">
                  <button
                    onClick={() => toggleDropdown(item.id)}
                    className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors duration-200 py-2"
                  >
                    {item.label}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        openDropdown === item.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown com subgrupos */}
                  {openDropdown === item.id && item.subGroups && (
                    <div className="absolute left-0 top-[52px] w-56 rounded-xl border border-zinc-200 bg-white py-2 shadow-xl animate-in fade-in slide-in-from-top-2">
                      {item.subGroups.map((group, index) => (
                        <div key={group.group}>
                          {index > 0 && <div className="my-1 border-t border-zinc-100" />}
                          <p className="px-5 pt-2 pb-1 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                            {group.group}
                          </p>
                          {group.items.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className="block px-5 py-2 text-sm text-zinc-700 hover:bg-zinc-100 transition-colors"
                              onClick={() => setOpenDropdown(null)}
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dropdown simples */}
                  {openDropdown === item.id && item.subItems && (
                    <div className="absolute left-0 top-[52px] w-56 rounded-xl border border-zinc-200 bg-white py-2 shadow-xl animate-in fade-in slide-in-from-top-2">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className="block px-5 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 transition-colors"
                          onClick={() => setOpenDropdown(null)}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Ações Desktop */}
            <div className="hidden md:flex items-center gap-2 ml-auto">
              <button className="p-2.5 rounded-xl hover:bg-zinc-100 transition-colors">
                <Grid3X3 className="h-5 w-5 text-zinc-600" />
              </button>

              <button className="relative p-2.5 rounded-xl hover:bg-zinc-100 transition-colors">
                <Bell className="h-5 w-5 text-zinc-600" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>

              <button className="p-2.5 rounded-xl hover:bg-zinc-100 transition-colors">
                <HelpCircle className="h-5 w-5 text-zinc-600" />
              </button>

              <button className="p-2.5 rounded-xl hover:bg-zinc-100 transition-colors">
                <User className="h-5 w-5 text-zinc-600" />
              </button>
            </div>

            {/* Hamburger Mobile */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden ml-auto p-2 rounded-xl hover:bg-zinc-100 transition-colors"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-80 bg-white z-50 shadow-2xl md:hidden overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-[#508991] rounded-xl flex items-center justify-center text-white">
                  ↑
                </div>
                <span className="font-semibold">Meu Negócio</span>
              </div>
              <button onClick={() => setMobileOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <nav className="p-6 space-y-8">
              {menu.map((item) => (
                <div key={item.id}>
                  <p className="text-xs font-semibold tracking-widest text-zinc-500 mb-3 uppercase">
                    {item.label}
                  </p>

                  {/* Mobile: subgrupos */}
                  {item.subGroups && (
                    <div className="space-y-4">
                      {item.subGroups.map((group) => (
                        <div key={group.group}>
                          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 px-4">
                            {group.group}
                          </p>
                          <div className="space-y-1">
                            {group.items.map((sub) => (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                onClick={() => setMobileOpen(false)}
                                className="block px-4 py-3 text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors"
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Mobile: itens simples */}
                  {item.subItems && (
                    <div className="space-y-1">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setMobileOpen(false)}
                          className="block px-4 py-3 text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}