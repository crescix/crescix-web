"use client";

import { useEffect, useMemo } from "react";
import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";

/**
 * Presets de período compartilhados entre listagens.
 *
 * Estado fica fora — o pai controla `preset`, `dateStart`, `dateEnd` e recebe
 * as datas ISO efetivas via `onRangeChange` toda vez que algo muda.
 *
 * Quando `preset !== "custom"`, ignoramos os inputs custom e calculamos
 * de novo a partir da hora atual. "Tudo" devolve strings vazias (sem filtro).
 */

export type PeriodoPreset = "hoje" | "7d" | "30d" | "mes" | "tudo" | "custom";

export const PERIODO_OPTIONS: { label: string; value: PeriodoPreset }[] = [
  { label: "Hoje", value: "hoje" },
  { label: "7 dias", value: "7d" },
  { label: "30 dias", value: "30d" },
  { label: "Este mês", value: "mes" },
  { label: "Tudo", value: "tudo" },
  { label: "Personalizado", value: "custom" },
];

interface PeriodoPresetsProps {
  preset: PeriodoPreset;
  dateStart: string;
  dateEnd: string;
  onPresetChange: (p: PeriodoPreset) => void;
  onCustomDateChange: (field: "start" | "end", value: string) => void;
  /** Notifica o pai do range efetivo (ISO YYYY-MM-DD ou "" pra sem filtro) */
  onRangeChange?: (from: string, to: string) => void;
}

export function resolveRange(
  preset: PeriodoPreset,
  customStart: string,
  customEnd: string
): { from: string; to: string } {
  const hoje = new Date();
  const todayISO = hoje.toISOString().slice(0, 10);

  const subDays = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };

  switch (preset) {
    case "hoje":
      return { from: todayISO, to: todayISO };
    case "7d":
      return { from: subDays(7), to: todayISO };
    case "30d":
      return { from: subDays(30), to: todayISO };
    case "mes": {
      const y = hoje.getFullYear();
      const m = String(hoje.getMonth() + 1).padStart(2, "0");
      return { from: `${y}-${m}-01`, to: todayISO };
    }
    case "custom":
      return { from: customStart, to: customEnd };
    case "tudo":
    default:
      return { from: "", to: "" };
  }
}

export function PeriodoPresets({
  preset,
  dateStart,
  dateEnd,
  onPresetChange,
  onCustomDateChange,
  onRangeChange,
}: PeriodoPresetsProps) {
  const range = useMemo(
    () => resolveRange(preset, dateStart, dateEnd),
    [preset, dateStart, dateEnd]
  );

  useEffect(() => {
    onRangeChange?.(range.from, range.to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.from, range.to]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PERIODO_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onPresetChange(opt.value)}
            className={`px-3 h-8 rounded-lg text-xs font-medium transition-colors border ${
              preset === opt.value
                ? "bg-green-500/15 text-green-400 border-green-500/30"
                : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {preset === "custom" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-white/50 text-xs font-medium block">De</label>
            <div className="relative">
              <Input
                type="date"
                value={dateStart}
                onChange={(e) => onCustomDateChange("start", e.target.value)}
                className="bg-white/5 border-white/10 text-white focus:border-green-500/50 h-9 text-sm pr-9"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-white/50 text-xs font-medium block">Até</label>
            <div className="relative">
              <Input
                type="date"
                value={dateEnd}
                onChange={(e) => onCustomDateChange("end", e.target.value)}
                className="bg-white/5 border-white/10 text-white focus:border-green-500/50 h-9 text-sm pr-9"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
