"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip,
} from "recharts";
import {
  ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, TrendingDown,
  AlertCircle, Clock, CheckCircle2, FileText, Plus, ShoppingCart,
  Receipt, Sparkles, ArrowRight, Zap,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getPerfil, getIniciais } from "@/lib/data/perfil";
import {
  getContasPagar, getContasReceber, getTransacoesFluxo,
  agruparPorDia, formatBRL, formatDateBR,
  type TransacaoFluxo,
} from "@/lib/data/financeiro";

function saudacao(): string {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] || "";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [perfilNome, setPerfilNome] = useState("");
  const [perfilFoto, setPerfilFoto] = useState<string | undefined>();
  const [transacoes, setTransacoes] = useState<TransacaoFluxo[]>([]);

  useEffect(() => {
    const perfil = getPerfil();
    setPerfilNome(perfil.nome || user?.name || "");
    setPerfilFoto(perfil.foto);
    setTransacoes(getTransacoesFluxo());
    setMounted(true);
  }, [user]);

  // ─── KPIs do mês corrente ──────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const hoje = new Date();
    const hojeISO = hoje.toISOString().slice(0, 10);
    const mesAtual = hojeISO.slice(0, 7);
    const limite7Dias = new Date();
    limite7Dias.setDate(limite7Dias.getDate() + 7);
    const limite7DiasISO = limite7Dias.toISOString().slice(0, 10);

    const receberTodas = mounted ? getContasReceber() : [];
    const pagarTodas = mounted ? getContasPagar() : [];

    let receitaMes = 0;
    let despesaMes = 0;
    let aReceber7d = 0;
    let aPagar7d = 0;
    let receberAtrasado = 0;
    let pagarAtrasado = 0;

    for (const r of receberTodas) {
      if (r.status === "Recebido" && r.data_recebimento?.startsWith(mesAtual)) {
        receitaMes += r.valor;
      }
      if (
        r.status === "Pendente" &&
        r.vencimento >= hojeISO &&
        r.vencimento <= limite7DiasISO
      ) {
        aReceber7d += r.valor;
      }
      if (r.status === "Atrasado") receberAtrasado += r.valor;
    }

    for (const p of pagarTodas) {
      if (p.status === "Pago" && p.data_pagamento?.startsWith(mesAtual)) {
        despesaMes += p.valor;
      }
      if (
        p.status === "Pendente" &&
        p.vencimento >= hojeISO &&
        p.vencimento <= limite7DiasISO
      ) {
        aPagar7d += p.valor;
      }
      if (p.status === "Atrasado") pagarAtrasado += p.valor;
    }

    const saldoMes = receitaMes - despesaMes;

    return {
      receitaMes, despesaMes, saldoMes,
      aReceber7d, aPagar7d,
      receberAtrasado, pagarAtrasado,
    };
  }, [mounted, transacoes]);

  // ─── Gráfico: últimos 30 dias ─────────────────────────────────────────────
  const grafico = useMemo(() => {
    const limite = new Date();
    limite.setDate(limite.getDate() - 30);
    const limiteISO = limite.toISOString().slice(0, 10);
    const filtradas = transacoes.filter(
      (t) => t.natureza === "Realizada" && t.data >= limiteISO
    );
    return agruparPorDia(filtradas);
  }, [transacoes]);

  // ─── Últimas movimentações ─────────────────────────────────────────────────
  const ultimas = useMemo(() => {
    return transacoes
      .filter((t) => t.natureza === "Realizada")
      .slice(0, 6);
  }, [transacoes]);

  // ─── Total de alertas ─────────────────────────────────────────────────────
  const totalAlertas =
    (kpis.receberAtrasado > 0 ? 1 : 0) +
    (kpis.pagarAtrasado > 0 ? 1 : 0);

  const iniciais = getIniciais(perfilNome || "?");
  const primeiroNomeUser = primeiroNome(perfilNome) || "por aqui";

  return (
    <div className="w-full min-h-screen bg-secondary p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-7xl space-y-6">

        {/* ── Hero: Greeting personalizado ─────────────────────────────────── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border border-green-500/20 rounded-3xl p-6 md:p-8 animate-fade-in">
          {/* Glow decoration */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-green-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              {perfilFoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={perfilFoto}
                  alt="Foto"
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white/10"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-black text-lg tracking-tighter border-2 border-white/10 glow-brand">
                  {mounted ? iniciais : "?"}
                </div>
              )}
              <div>
                <p className="text-white/50 text-xs font-medium uppercase tracking-widest mb-1">
                  Dashboard
                </p>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter">
                  {saudacao()}, <span className="text-green-400">{primeiroNomeUser}</span>!
                </h1>
                <p className="text-white/50 text-sm mt-1">
                  {new Date().toLocaleDateString("pt-BR", {
                    weekday: "long", day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Status pill */}
            <div className="flex items-center gap-2 px-4 h-10 rounded-full bg-white/5 border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-white/70 text-xs font-medium">
                {totalAlertas > 0
                  ? `${totalAlertas} ${totalAlertas === 1 ? "alerta" : "alertas"} pendente${totalAlertas === 1 ? "" : "s"}`
                  : "Tudo em dia"}
              </span>
            </div>
          </div>
        </div>

        {/* ── KPI cards principais ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Receita do mês"
            value={formatBRL(kpis.receitaMes)}
            icon={<ArrowUpRight className="w-5 h-5 text-green-400" />}
            iconBg="bg-green-500/10"
            valueColor="text-green-400"
            hint="Contas recebidas"
            hintIcon={<TrendingUp className="w-3 h-3" />}
            mounted={mounted}
          />
          <KpiCard
            label="Despesas do mês"
            value={formatBRL(kpis.despesaMes)}
            icon={<ArrowDownRight className="w-5 h-5 text-red-400" />}
            iconBg="bg-red-500/10"
            valueColor="text-red-400"
            hint="Contas pagas"
            hintIcon={<TrendingDown className="w-3 h-3" />}
            mounted={mounted}
          />
          <KpiCard
            label="Saldo do mês"
            value={`${kpis.saldoMes < 0 ? "-" : ""}${formatBRL(Math.abs(kpis.saldoMes))}`}
            icon={<Wallet className={`w-5 h-5 ${kpis.saldoMes >= 0 ? "text-green-400" : "text-red-400"}`} />}
            iconBg={kpis.saldoMes >= 0 ? "bg-green-500/10" : "bg-red-500/10"}
            valueColor={kpis.saldoMes >= 0 ? "text-green-400" : "text-red-400"}
            hint={kpis.saldoMes >= 0 ? "Positivo" : "Negativo"}
            mounted={mounted}
          />
          <KpiCard
            label="Próx. 7 dias"
            value={formatBRL(kpis.aReceber7d - kpis.aPagar7d)}
            icon={<Clock className="w-5 h-5 text-amber-400" />}
            iconBg="bg-amber-500/10"
            valueColor="text-amber-400"
            hint="Previsão líquida"
            mounted={mounted}
          />
        </div>

        {/* ── Gráfico + Alertas ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Gráfico */}
          <div className="lg:col-span-2 bg-primary rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-white">Fluxo dos últimos 30 dias</h2>
                <p className="text-xs text-white/30 mt-0.5">Entradas vs saídas realizadas</p>
              </div>
              <Link
                href="/financeiro/fluxo-de-caixa"
                className="text-xs text-green-400 font-medium hover:underline inline-flex items-center gap-1"
              >
                Ver detalhado
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="h-56 w-full">
              {!mounted ? (
                <div className="h-full flex items-center justify-center text-white/30 text-sm">
                  Carregando...
                </div>
              ) : grafico.length === 0 ? (
                <div className="h-full flex items-center justify-center text-white/30 text-sm">
                  Sem dados realizados no período
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={grafico} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dash-entradas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="dash-saidas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="data"
                      tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                      tickFormatter={(v: string) => formatDateBR(v).slice(0, 5)}
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <YAxis
                      tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                      tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F3447",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                      labelFormatter={(v: string) => formatDateBR(v)}
                      formatter={(v: number) => formatBRL(v)}
                    />
                    <Area
                      type="monotone"
                      dataKey="entradas"
                      name="Entradas"
                      stroke="#22c55e"
                      fill="url(#dash-entradas)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="saidas"
                      name="Saídas"
                      stroke="#f87171"
                      fill="url(#dash-saidas)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Alertas */}
          <div className="bg-primary rounded-2xl border border-white/10 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-amber-400" />
              </div>
              <h2 className="text-sm font-bold text-white">Atenção</h2>
            </div>

            <div className="space-y-3 flex-1">
              {kpis.receberAtrasado > 0 && (
                <AlertRow
                  icon={<AlertCircle className="w-4 h-4 text-red-400" />}
                  iconBg="bg-red-500/10"
                  label="A receber atrasado"
                  value={formatBRL(kpis.receberAtrasado)}
                  href="/financeiro/receber"
                />
              )}
              {kpis.pagarAtrasado > 0 && (
                <AlertRow
                  icon={<AlertCircle className="w-4 h-4 text-red-400" />}
                  iconBg="bg-red-500/10"
                  label="A pagar atrasado"
                  value={formatBRL(kpis.pagarAtrasado)}
                  href="/financeiro/pagar"
                />
              )}
              {kpis.aReceber7d > 0 && (
                <AlertRow
                  icon={<Clock className="w-4 h-4 text-amber-400" />}
                  iconBg="bg-amber-500/10"
                  label="A receber em 7 dias"
                  value={formatBRL(kpis.aReceber7d)}
                  href="/financeiro/receber"
                />
              )}
              {kpis.aPagar7d > 0 && (
                <AlertRow
                  icon={<Clock className="w-4 h-4 text-amber-400" />}
                  iconBg="bg-amber-500/10"
                  label="A pagar em 7 dias"
                  value={formatBRL(kpis.aPagar7d)}
                  href="/financeiro/pagar"
                />
              )}
              {mounted &&
                kpis.receberAtrasado === 0 &&
                kpis.pagarAtrasado === 0 &&
                kpis.aReceber7d === 0 &&
                kpis.aPagar7d === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-white/40 text-sm">Nenhum alerta no momento</p>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* ── Quick Actions ────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-green-400" />
            <h2 className="text-sm font-bold text-white/80 uppercase tracking-widest">
              Ações Rápidas
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <QuickAction
              icon={<ShoppingCart className="w-5 h-5" />}
              label="Novo Pedido"
              href="/vendas/pedidos/novo"
            />
            <QuickAction
              icon={<FileText className="w-5 h-5" />}
              label="Novo Orçamento"
              href="/vendas/orcamentos/novo"
            />
            <QuickAction
              icon={<Receipt className="w-5 h-5" />}
              label="Conta a Pagar"
              href="/financeiro/pagar"
            />
            <QuickAction
              icon={<Plus className="w-5 h-5" />}
              label="Conta a Receber"
              href="/financeiro/receber"
            />
          </div>
        </div>

        {/* ── Últimas movimentações ────────────────────────────────────────── */}
        <div className="bg-primary rounded-2xl border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-green-500/15 flex items-center justify-center">
                <Zap className="w-4 h-4 text-green-400" />
              </div>
              <h2 className="text-sm font-bold text-white">Últimas movimentações</h2>
            </div>
            <Link
              href="/financeiro/fluxo-de-caixa"
              className="text-xs text-green-400 font-medium hover:underline inline-flex items-center gap-1"
            >
              Ver tudo
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {!mounted ? (
            <div className="py-12 text-center text-white/30 text-sm">Carregando...</div>
          ) : ultimas.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                <Zap className="w-5 h-5 text-white/20" />
              </div>
              <p className="text-white/40 text-sm">Sem movimentações registradas</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {ultimas.map((t) => (
                <div
                  key={t.id}
                  className="px-6 py-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      t.tipo === "entrada" ? "bg-green-500/10" : "bg-red-500/10"
                    }`}
                  >
                    {t.tipo === "entrada" ? (
                      <ArrowUpRight className="w-4 h-4 text-green-400" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {t.descricao}
                    </p>
                    <p className="text-white/40 text-xs mt-0.5">
                      {t.categoria}
                      {t.contraparte && ` · ${t.contraparte}`}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className={`text-sm font-bold tabular-nums ${
                        t.tipo === "entrada" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {t.tipo === "entrada" ? "+" : "−"} {formatBRL(t.valor)}
                    </p>
                    <p className="text-white/40 text-xs mt-0.5">{formatDateBR(t.data)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  valueColor: string;
  hint?: string;
  hintIcon?: React.ReactNode;
  mounted: boolean;
}

function KpiCard({ label, value, icon, iconBg, valueColor, hint, hintIcon, mounted }: KpiCardProps) {
  return (
    <div className="bg-primary rounded-2xl border border-white/10 p-5 hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className={`${iconBg} rounded-xl p-2.5`}>{icon}</div>
      </div>
      <p className="text-xs text-white/50 font-medium mb-1">{label}</p>
      <p className={`text-xl font-black tracking-tighter ${valueColor} truncate`}>
        {mounted ? value : "—"}
      </p>
      {hint && (
        <div className={`flex items-center gap-1 mt-2 text-xs ${valueColor} opacity-70`}>
          {hintIcon}
          {hint}
        </div>
      )}
    </div>
  );
}

interface AlertRowProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  href: string;
}

function AlertRow({ icon, iconBg, label, value, href }: AlertRowProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
    >
      <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white/70 text-xs">{label}</p>
        <p className="text-white text-sm font-semibold truncate">{value}</p>
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  href: string;
}

function QuickAction({ icon, label, href }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-primary border border-white/10 hover:border-green-500/30 hover:bg-green-500/5 transition-base"
    >
      <div className="w-10 h-10 rounded-xl bg-green-500/10 group-hover:bg-green-500/20 flex items-center justify-center text-green-400 transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold">{label}</p>
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-green-400 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}
