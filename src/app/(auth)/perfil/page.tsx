"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, Save, Check, Upload, Trash2,
  User as UserIcon, Mail, Phone, Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Perfil, TIPOS_COMERCIO, TipoComercio,
  getPerfil, setPerfil, getIniciais,
} from "@/lib/data/perfil";
import { useAuth } from "@/context/auth-context";
import { maskPhone } from "@/lib/utils/masks";

const schema = z.object({
  nome: z.string().min(2, "Nome obrigatório (mín. 2 caracteres)"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(10, "Telefone inválido"),
  tipo_comercio: z.string().min(1, "Selecione o tipo de comércio"),
});

type FormData = z.infer<typeof schema>;

export default function PerfilPage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [foto, setFoto] = useState<string | undefined>(undefined);
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "", email: "", telefone: "", tipo_comercio: "",
    },
  });

  // Hidrata o form com dados existentes do perfil (ou do auth)
  useEffect(() => {
    const perfil = getPerfil();
    const initial = {
      nome: perfil.nome || user?.name || "",
      email: perfil.email || user?.email || "",
      telefone: maskPhone(perfil.telefone || user?.phone || ""),
      tipo_comercio: perfil.tipo_comercio || "",
    };
    reset(initial);
    setFoto(perfil.foto);
    setMounted(true);
  }, [reset, user]);

  const nomeAtual = watch("nome");

  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFoto(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFoto = () => {
    setFoto(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = (data: FormData) => {
    const novoPerfil: Perfil = {
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      tipo_comercio: data.tipo_comercio as TipoComercio,
      foto,
    };
    setPerfil(novoPerfil);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    reset(data); // reseta o "dirty"
  };

  return (
    <div className="w-full min-h-screen bg-secondary p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl text-white/50 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">
              Conta
            </p>
            <h1 className="text-3xl font-black text-white tracking-tighter">
              Meu Perfil
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Avatar */}
          <div className="bg-primary rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-6">
              <div className="relative shrink-0">
                {foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={foto}
                    alt="Foto de perfil"
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-white/10"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-black text-3xl tracking-tighter border-2 border-white/10">
                    {mounted ? getIniciais(nomeAtual || "?") : "?"}
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <p className="text-white font-semibold">Foto de perfil</p>
                <p className="text-white/40 text-xs">
                  PNG, JPG ou GIF até 2MB. Sem foto, mostramos suas iniciais em verde.
                </p>
                <div className="flex gap-2 pt-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFotoUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 h-9 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 text-sm font-semibold transition-all active:scale-95"
                  >
                    <Upload className="h-4 w-4" />
                    {foto ? "Trocar" : "Enviar foto"}
                  </button>
                  {foto && (
                    <button
                      type="button"
                      onClick={handleRemoveFoto}
                      className="flex items-center gap-2 px-4 h-9 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm font-semibold transition-all active:scale-95"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remover
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dados pessoais */}
          <div className="bg-primary rounded-2xl border border-white/10 p-6 space-y-5">
            <h2 className="text-base font-bold text-white">Dados pessoais</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Nome completo"
                icon={<UserIcon className="w-3.5 h-3.5" />}
                error={errors.nome?.message}
              >
                <Input
                  {...register("nome")}
                  placeholder="Seu nome completo"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-green-500/50 h-10 text-sm"
                />
              </Field>

              <Field
                label="E-mail"
                icon={<Mail className="w-3.5 h-3.5" />}
                error={errors.email?.message}
              >
                <Input
                  type="email"
                  {...register("email")}
                  placeholder="seu@email.com"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-green-500/50 h-10 text-sm"
                />
              </Field>

              <Field
                label="Telefone / WhatsApp"
                icon={<Phone className="w-3.5 h-3.5" />}
                error={errors.telefone?.message}
              >
                <Input
                  value={watch("telefone") ?? ""}
                  onChange={(e) => setValue("telefone", maskPhone(e.target.value), { shouldDirty: true })}
                  placeholder="+55 (11) 99999-9999"
                  inputMode="numeric"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-green-500/50 h-10 text-sm"
                />
              </Field>

              <Field
                label="Tipo de comércio"
                icon={<Store className="w-3.5 h-3.5" />}
                error={errors.tipo_comercio?.message}
              >
                <select
                  {...register("tipo_comercio")}
                  className="w-full bg-white/5 border border-white/10 text-white focus:border-green-500/50 h-10 px-3 rounded-md focus:outline-none text-sm"
                >
                  <option value="" className="bg-primary">Selecione...</option>
                  {TIPOS_COMERCIO.map((t) => (
                    <option key={t} value={t} className="bg-primary">{t}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          {/* Footer com salvar */}
          <div className="flex items-center justify-end gap-3">
            {saved && (
              <span className="flex items-center gap-2 text-green-400 text-sm font-medium animate-fade-in">
                <Check className="w-4 h-4" />
                Perfil salvo
              </span>
            )}
            <Button
              type="submit"
              disabled={!isDirty && !saved}
              className="bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-full px-6 h-10 transition-all hover:scale-105 active:scale-95 glow-brand-hover"
            >
              <Save className="mr-2 h-4 w-4" />
              Salvar alterações
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}

function Field({
  label, icon, error, children,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-wider">
        <span className="text-white/40">{icon}</span>
        {label}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}
