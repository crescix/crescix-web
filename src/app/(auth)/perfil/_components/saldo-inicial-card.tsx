"use client";

import { useState } from "react";
import { Wallet, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/ui/toast";
import { updateMe } from "@/services/auth-me";
import { extractApiError } from "@/lib/utils/api-errors";

/**
 * Card pra editar o saldo inicial em caixa.
 *
 * Vive isolado do form principal de perfil porque (a) é uma feature
 * nova e isolável, (b) o form principal hoje salva em localStorage
 * (dívida técnica preexistente) e o saldo inicial é o primeiro campo
 * que persiste de verdade no backend. Quando o form principal for
 * migrado pra API, dá pra absorver esse card lá.
 *
 * Aceita digitação com vírgula (estilo BR) e sem máscara — a IA com
 * cliente em mente: quanto menos atrito no input numérico, melhor.
 */
export function SaldoInicialCard() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  // Input controlado em string pra aceitar vírgula como decimal.
  // Convertido pra número só na hora de salvar.
  const [valor, setValor] = useState<string>(() =>
    user?.saldoInicial != null
      ? user.saldoInicial.toFixed(2).replace(".", ",")
      : ""
  );
  const [saving, setSaving] = useState(false);

  const original =
    user?.saldoInicial != null ? user.saldoInicial.toFixed(2).replace(".", ",") : "";
  const isDirty = valor.trim() !== original;

  function parseValor(): number | null {
    const limpo = valor.trim().replace(/\./g, "").replace(",", ".");
    if (limpo === "") return 0;
    const n = Number(limpo);
    return Number.isFinite(n) ? n : null;
  }

  async function handleSalvar() {
    const parsed = parseValor();
    if (parsed === null) {
      toast.error("Valor inválido. Use só números, ex.: 5000,00");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateMe({ saldoInicial: parsed });
      updateUser({ saldoInicial: updated.saldoInicial });
      toast.success("Saldo inicial salvo.");
      // Re-formata o input pra refletir o valor canônico salvo
      setValor(updated.saldoInicial!.toFixed(2).replace(".", ","));
    } catch (err) {
      toast.error(extractApiError(err, "Não consegui salvar o saldo inicial agora."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-primary rounded-2xl border border-white/10 p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-brand/15 border border-brand/25 flex items-center justify-center flex-shrink-0">
          <Wallet className="w-5 h-5 text-brand" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold">Saldo inicial em caixa</h3>
          <p className="text-white/55 text-sm mt-1 leading-relaxed">
            Quanto você tinha em caixa quando começou a usar o CrescIX. Soma
            como ponto de partida no fluxo de caixa. Deixe em branco se prefere
            começar do zero.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1">
          <label
            htmlFor="saldo-inicial-input"
            className="block text-white/70 text-xs uppercase tracking-wider font-medium mb-1.5"
          >
            R$
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">
              R$
            </span>
            <input
              id="saldo-inicial-input"
              type="text"
              inputMode="decimal"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              className="
                w-full h-11 pl-10 pr-3
                bg-secondary border border-white/10
                rounded-lg
                text-white text-base font-semibold
                focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/15
                transition-colors
              "
            />
          </div>
        </div>
        <Button
          type="button"
          onClick={handleSalvar}
          disabled={!isDirty || saving}
          className="bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-full px-6 h-11 transition-all"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
