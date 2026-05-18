"use client";

import { useCallback, useEffect, useState } from "react";
import { Send, Copy, Check, Loader2, RefreshCw, Unlink, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { extractApiError } from "@/lib/utils/api-errors";
import {
  getTelegramStatus,
  startTelegramPairing,
  unpairTelegram,
} from "@/services/telegram";

/**
 * Card "Vincular Telegram" — vive na tela de Perfil.
 *
 * Estados:
 * - loading inicial: spinner enquanto GET /telegram/me responde
 * - paired = true: mostra status + botão "Desvincular"
 * - paired = false: botão "Gerar código" → mostra code, countdown e
 *   deep link pra abrir o bot já com o código.
 */

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function TelegramPairingCard() {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [paired, setPaired] = useState(false);
  const [telegramId, setTelegramId] = useState<string | null>(null);

  const [code, setCode] = useState<string | null>(null);
  const [botUsername, setBotUsername] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);

  const [generating, setGenerating] = useState(false);
  const [unpairing, setUnpairing] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const status = await getTelegramStatus();
      setPaired(status.paired);
      setTelegramId(status.telegramId);
    } catch (err) {
      toast.error(extractApiError(err, "Não consegui ver o status do Telegram agora."));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Countdown do código
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const left = expiresAt - Date.now();
      setRemaining(Math.max(0, left));
      if (left <= 0) {
        setCode(null);
        setExpiresAt(null);
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  // ── Polling do status enquanto aguarda pareamento ─────────────────────────
  // Quando o usuário gera um código, ele vai pro celular pra colar no bot.
  // Sem polling, o web fica "preso" no estado "código aguardando" até a
  // página ser recarregada. Polling a cada 3s pra detectar o sucesso e
  // transicionar a UI em tempo real (toast + estado "vinculado").
  //
  // 3s × 5min de TTL do código = 100 requests no pior caso, bem abaixo do
  // rate limit global da API (200/min). Para sozinho quando o código
  // expira (effect dependente de `code`) ou quando o pareamento conclui.
  useEffect(() => {
    if (!code || paired) return;
    let cancelled = false;

    const verificar = async () => {
      try {
        const status = await getTelegramStatus();
        if (cancelled) return;
        if (status.paired) {
          setPaired(true);
          setTelegramId(status.telegramId);
          // Limpa o estado "código aguardando" — o JSX bifurca pelo
          // `paired` agora e mostra o card de sucesso.
          setCode(null);
          setExpiresAt(null);
          setRemaining(0);
          toast.success("Telegram vinculado! Agora é só falar com o bot.");
        }
      } catch {
        // Silencioso. Erro transitório no polling não polui a UI. Se for
        // permanente o usuário ainda pode tentar reload manualmente.
      }
    };

    const interval = setInterval(verificar, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [code, paired, toast]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await startTelegramPairing();
      setCode(res.code);
      setBotUsername(res.botUsername);
      setExpiresAt(new Date(res.expiresAt).getTime());
      setCopied(false);
    } catch (err) {
      toast.error(extractApiError(err, "Não consegui gerar o código agora. Tente em alguns instantes."));
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Código copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não consegui copiar agora.");
    }
  };

  const handleUnpair = async () => {
    setUnpairing(true);
    try {
      await unpairTelegram();
      setPaired(false);
      setTelegramId(null);
      toast.success("Telegram desvinculado.");
    } catch (err) {
      toast.error(extractApiError(err, "Não consegui desvincular agora. Tente novamente."));
    } finally {
      setUnpairing(false);
    }
  };

  const deepLink =
    code && botUsername ? `https://t.me/${botUsername}?start=${code}` : null;

  return (
    <div className="bg-primary rounded-2xl border border-white/10 p-6 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
            <Send className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Vincular Telegram</h2>
            <p className="text-white/40 text-xs mt-0.5">
              Registre vendas, despesas e relatórios pelo bot do Telegram.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-white/60">
          <Loader2 className="w-4 h-4 animate-spin text-green-400" />
          <span className="text-sm">Carregando status...</span>
        </div>
      ) : paired ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <Check className="w-4 h-4" />
            <span className="font-medium">Conta vinculada</span>
            {telegramId && (
              <span className="text-white/40 font-mono text-xs">
                (chat #{telegramId.slice(-6)})
              </span>
            )}
          </div>
          <p className="text-white/50 text-sm">
            Você já pode enviar comandos diretamente no Telegram. Pra
            desvincular essa conta dispositivo, clique abaixo.
          </p>
          <Button
            type="button"
            onClick={handleUnpair}
            disabled={unpairing}
            variant="ghost"
            className="border border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
          >
            {unpairing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Unlink className="mr-2 h-4 w-4" />
            )}
            {unpairing ? "Desvinculando..." : "Desvincular Telegram"}
          </Button>
        </div>
      ) : code ? (
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col items-center gap-3">
            <span className="text-white/40 text-xs font-medium uppercase tracking-widest">
              Seu código
            </span>
            <span className="text-5xl font-black text-green-400 tabular-nums tracking-widest">
              {code}
            </span>
            <span className="text-white/40 text-xs">
              Expira em <span className="text-white font-medium">{formatRemaining(remaining)}</span>
            </span>
          </div>

          <ol className="text-white/60 text-sm space-y-2 list-decimal list-inside">
            <li>Abra o bot{" "}
              {botUsername ? (
                <a
                  href={deepLink ?? `https://t.me/${botUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:underline inline-flex items-center gap-1"
                >
                  @{botUsername}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-white font-medium">no Telegram</span>
              )}
            </li>
            <li>Envie o código de 6 dígitos pra ele (ou use o link acima)</li>
            <li>Pronto — você verá uma mensagem de boas-vindas</li>
          </ol>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={handleCopy}
              variant="ghost"
              className="border border-white/15 text-white hover:bg-white/10"
            >
              {copied ? (
                <Check className="mr-2 h-4 w-4 text-green-400" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              {copied ? "Copiado" : "Copiar código"}
            </Button>

            {deepLink && (
              <a
                href={deepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 h-10 rounded-md bg-green-500 hover:bg-green-400 text-white text-sm font-bold transition-colors"
              >
                <Send className="h-4 w-4" />
                Abrir no Telegram
              </a>
            )}

            <Button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              variant="ghost"
              className="border border-white/15 text-white/70 hover:bg-white/10"
            >
              {generating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Gerar novo
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-white/50 text-sm">
            Gere um código de 6 dígitos e envie pro bot. Depois disso, basta
            falar com ele em linguagem natural — ele entende voz e texto.
          </p>
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="bg-green-500 hover:bg-green-400 text-white font-bold disabled:opacity-60"
          >
            {generating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {generating ? "Gerando..." : "Gerar código de pareamento"}
          </Button>
        </div>
      )}
    </div>
  );
}
