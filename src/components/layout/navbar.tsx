"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getPerfil } from "@/lib/data/perfil";
import { NAVBAR_MENU } from "./navbar-menu";
import { NavbarAvatar } from "./navbar-avatar";
import { NavbarMobile } from "./navbar-mobile";
import { NavbarNotifications } from "./navbar-notifications";

export function Navbar() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [perfil, setPerfil] = useState<{ nome: string; email: string; foto?: string }>({
    nome: "", email: "",
  });

  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const { isAuthenticated, isAuthenticating, user } = useAuth();

  // Hidrata perfil
  useEffect(() => {
    const p = getPerfil();
    setPerfil({
      nome: p.nome || user?.name || "",
      email: p.email || user?.email || "",
      foto: p.foto,
    });
  }, [user, pathname]);

  // Click fora fecha dropdown
  useEffect(() => {
    if (!openDropdown) return;
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openDropdown]);

  // Fecha dropdown ao navegar
  useEffect(() => {
    setOpenDropdown(null);
  }, [pathname]);

  if (!isAuthenticated || isAuthenticating) return null;

  const toggle = (id: string) =>
    setOpenDropdown((prev) => (prev === id ? null : id));

  // Detecta se um item do menu tem rota ativa
  const isItemActive = (id: string) => {
    const item = NAVBAR_MENU.find((m) => m.id === id);
    if (!item) return false;
    return item.items.some((sub) => pathname === sub.href || pathname.startsWith(sub.href + "/"));
  };

  return (
    <>
      <header
        ref={navRef}
        className="sticky top-4 z-40 px-4"
      >
        <div className="mx-auto max-w-7xl">
          <div className="glass rounded-2xl shadow-2xl shadow-black/40">
            <div className="flex h-16 items-center px-4 md:px-6 gap-2">

              {/* Logo */}
              <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
                <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center overflow-hidden glow-brand">
                  <Image
                    src="/images/Logo.png"
                    alt="CrescIX"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>
                <span className="hidden sm:block text-white font-black tracking-tight text-lg">
                  Cresc<span className="text-green-500">IX</span><span className="text-green-500">.</span>
                </span>
              </Link>

              {/* Menu desktop */}
              <nav className="hidden md:flex items-center gap-1 ml-6">
                {NAVBAR_MENU.map((item) => {
                  const active = isItemActive(item.id);
                  const isOpen = openDropdown === item.id;
                  return (
                    <div key={item.id} className="relative">
                      <button
                        onClick={() => toggle(item.id)}
                        className={`flex items-center gap-1.5 px-3 h-9 rounded-lg text-sm font-medium transition-base ${
                          active
                            ? "bg-green-500/10 text-green-400"
                            : isOpen
                              ? "bg-white/10 text-white"
                              : "text-white/70 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {item.label}
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {isOpen && (
                        <div className="absolute left-0 top-12 min-w-[200px] rounded-xl glass-strong overflow-hidden shadow-2xl animate-slide-up z-50">
                          <div className="py-1.5">
                            {item.items.map((sub) => {
                              const itemActive = pathname === sub.href;
                              return (
                                <Link
                                  key={sub.href}
                                  href={sub.href}
                                  onClick={() => setOpenDropdown(null)}
                                  className={`block px-4 py-2.5 text-sm transition-colors ${
                                    itemActive
                                      ? "bg-green-500/15 text-green-400 font-semibold"
                                      : "text-white/80 hover:bg-white/5 hover:text-white"
                                  }`}
                                >
                                  {sub.label}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

              {/* Spacer pra empurrar avatar pra direita */}
              <div className="flex-1" />

              {/* Notificações: sino com dropdown de contas vencendo */}
              <NavbarNotifications />

              {/* Avatar (desktop) */}
              <div className="hidden md:block">
                <NavbarAvatar />
              </div>

              {/* Hamburger (mobile) */}
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center border border-white/10 hover:bg-white/5 transition-colors"
                aria-label="Abrir menu"
              >
                <Menu className="w-5 h-5 text-white/80" />
              </button>

            </div>
          </div>
        </div>
      </header>

      <NavbarMobile
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        menu={NAVBAR_MENU}
        perfil={perfil}
      />
    </>
  );
}
