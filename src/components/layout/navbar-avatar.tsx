"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getPerfil, getIniciais } from "@/lib/data/perfil";

export function NavbarAvatar() {
  const [open, setOpen] = useState(false);
  const [perfil, setPerfil] = useState<{ nome: string; email: string; foto?: string }>({
    nome: "", email: "",
  });
  const ref = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();

  // Carrega perfil persistido + fallback do auth
  useEffect(() => {
    const p = getPerfil();
    setPerfil({
      nome: p.nome || user?.name || "",
      email: p.email || user?.email || "",
      foto: p.foto,
    });
  }, [user, open]); // re-hidrata ao abrir caso o perfil tenha sido editado

  // Click fora fecha
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const iniciais = getIniciais(perfil.nome || "?");

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 pl-1 pr-2 h-10 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 transition-base group"
      >
        {perfil.foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={perfil.foto}
            alt="Foto"
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-xs">
            {iniciais}
          </div>
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 text-white/40 group-hover:text-white/60 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-64 rounded-xl glass-strong overflow-hidden shadow-2xl animate-slide-up z-50">
          {/* Header com nome/email */}
          <div className="p-4 border-b border-white/10">
            <p className="text-white font-semibold text-sm truncate">
              {perfil.nome || "Sem nome"}
            </p>
            <p className="text-white/50 text-xs truncate">
              {perfil.email || "—"}
            </p>
          </div>

          {/* Itens */}
          <div className="py-1">
            <Link
              href="/perfil"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-white/80 hover:bg-white/5 hover:text-white text-sm transition-colors"
            >
              <UserIcon className="w-4 h-4 text-white/40" />
              Meu Perfil
            </Link>
          </div>

          {/* Sair */}
          <div className="py-1 border-t border-white/10">
            <button
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400/90 hover:bg-red-500/10 hover:text-red-400 text-sm transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
