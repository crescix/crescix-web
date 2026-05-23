"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, LogOut, User as UserIcon, CreditCard } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getIniciais } from "@/lib/data/perfil";
import type { MenuItem } from "./navbar-menu";

interface NavbarMobileProps {
  isOpen: boolean;
  onClose: () => void;
  menu: MenuItem[];
  perfil: { nome: string; email: string; foto?: string };
}

export function NavbarMobile({ isOpen, onClose, menu, perfil }: NavbarMobileProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  // Trava scroll do body quando aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Escape fecha
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const iniciais = getIniciais(perfil.nome || "?");

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[85%] max-w-sm glass-strong z-50 md:hidden overflow-y-auto animate-slide-up">

        {/* Header */}
        <div className="sticky top-0 glass-strong border-b border-white/10 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {perfil.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={perfil.foto} alt="Foto" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                {iniciais}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">
                {perfil.nome || "Sem nome"}
              </p>
              <p className="text-white/50 text-xs truncate">{perfil.email || "—"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu */}
        <nav className="px-5 py-6 space-y-7">
          {menu.map((item) => (
            <div key={item.id}>
              <p className="text-white/40 text-xs font-bold tracking-widest uppercase mb-2 px-1">
                {item.label}
              </p>
              <div className="space-y-1">
                {item.items.map((sub) => {
                  const isActive = pathname === sub.href;
                  return (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={onClose}
                      className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        isActive
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
          ))}

          {/* Perfil + Sair */}
          <div className="pt-4 border-t border-white/10 space-y-1">
            <Link
              href="/perfil"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:bg-white/5 hover:text-white text-sm transition-colors"
            >
              <UserIcon className="w-4 h-4 text-white/40" />
              Meu Perfil
            </Link>
            <Link
              href="/assinatura"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:bg-white/5 hover:text-white text-sm transition-colors"
            >
              <CreditCard className="w-4 h-4 text-white/40" />
              Assinatura
            </Link>
            <button
              onClick={() => { onClose(); signOut(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400/90 hover:bg-red-500/10 hover:text-red-400 text-sm transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
