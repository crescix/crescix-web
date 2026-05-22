"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageCircle, Copy, Check, Loader2, RefreshCw, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { extractApiError } from "@/lib/utils/api-errors";
import {
  getWhatsappStatus,
  startWhatsappPairing,
  unpairWhatsapp,
} from "@/services/whatsapp";

/**
 * Card "Vincular WhatsApp" — vive na tela de Perfil, ao lado do card
 * do Telegram.
 *
 * Difere do card Telegram em 1 ponto importante: o WhatsApp não tem
 * "deep link" pra abrir o bot já com o código preenchido. O usuário
 * precisa abrir manualmente uma conversa com o número do bot CrescIX
 * (que o admin divulga, geralmente um chip dedicado) e enviar o código.
 *
 * `NEXT_PUBLIC_WHATSAPP_BOT_PHONE` opcional — quando definido, mostramos
 * um link `wa.me` que abre o WhatsApp já na conversa do bot. Sem ela,
 * só mostramos o código (admin deve divulgar o número de outra forma).
 *
 * Polling igual ao card Telegram: após gerar código, ficamos consultando
 * /whatsapp/me a cada 3s pra detectar o sucesso e mudar a UI sem reload.
 */

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Remove o '+' opcional e espaços de um phone no formato E.164.
 * Usado pra montar links wa.me que só aceitam dígitos puros.
 */
function digitsOnly(phone: string | undefined | null): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g, "");
  return d.length >= 10 ? d : null;
}

export function WhatsappPairingCard() {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [paired, setPaired] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState<string | null>(null);

  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);

  const [generating, setGenerating] = useState(false);
  const [unpairing, setUnpairing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Número do bot CrescIX no WhatsApp (chip dedicado). Definido por env
  // var pública pra evitar hardcode. Quando ausente, escondemos o link
  // wa.me e o admin precisa divulgar o número manualmente.
  const botPhone = digitsOnly(process.env.NEXT_PUBLIC_WHATSAPP_BOT_PHONE);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const status = await getWhatsappStatus();
      setPaired(status.paired);
      setWhatsappPhone(status.whatsappPhone);
    } catch (err) {
      toast.error(extractApiError(err, "Não consegui ver o status do WhatsApp agora."));
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

  // Polling do status enquanto aguarda pareamento (mesma lógica do card
  // Telegram). 3s × 5min = 100 requests no pior caso, dentro do rate
  // limit global.
  useEffect(() => {
    if (!code || paired) return;
    let cancelled = false;

    const verificar = async () => {
      try {
        const status = await getWhatsappStatus();
        if (cancelled) return;
        if (status.paired) {
          setPaired(true);
          setWhatsappPhone(status.whatsappPhone);
          setCode(null);
          setExpiresAt(null);
          setRemaining(0);
          toast.success("WhatsApp vinculado! Agora é só conversar com o bot.");
        }
      } catch {
        // silencioso — erro transitório no polling não polui UI
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
      const res = await startWhatsappPairing();
      setCode(res.code);
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
      await unpairWhatsapp();
      setPaired(false);
      setWhatsappPhone(null);
      toast.success("WhatsApp desvinculado.");
    } catch (err) {
      toast.error(extractApiError(err, "Não consegui desvincular agora. Tente novamente."));
    } finally {
      setUnpairing(false);
    }
  };

  // Link wa.me já com texto sugerido — facilita pro usuário.
  const waLink =
    botPhone && code
      ? `https://wa.me/${botPhone}?text=${encodeURIComponent(code)}`
      : null;

  return (
    <div className="bg-primary rounded-2xl border border-white/10 p-6 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Vincular WhatsApp</h2>
            <p className="text-white/40 text-xs mt-0.5">
              Registre vendas, despesas e relatórios falando com a CrescIX no WhatsApp.
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
            {whatsappPhone && (
              <span className="text-white/40 font-mono text-xs">
                (...{whatsappPhone.slice(-4)})
              </span>
            )}
          </div>
          <p className="text-white/50 text-sm">
            Você já pode mandar mensagem pra CrescIX no WhatsApp. Pra
            desvincular esse número, clique abaixo.
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
            {unpairing ? "Desvinculando..." : "Desvincular WhatsApp"}
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
            <li>
              Abra uma conversa com a CrescIX no WhatsApp
              {botPhone && (
                <>
                  {" "}
                  (
                  <a
                    href={waLink ?? `https://wa.me/${botPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:underline"
                  >
                    abrir agora
                  </a>
                  )
                </>
              )}
            </li>
            <li>Envie o código de 6 dígitos acima</li>
            <li>Pronto — vai chegar uma mensagem de boas-vindas</li>
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

            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 h-10 rounded-md bg-green-500 hover:bg-green-400 text-white text-sm font-bold transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Abrir no WhatsApp
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
            Gere um código de 6 dígitos e envie pra CrescIX no WhatsApp. A
            partir daí, é só falar — vendas, despesas, relatórios, tudo
            em linguagem natural.
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
              <MessageCircle className="mr-2 h-4 w-4" />
            )}
            {generating ? "Gerando..." : "Gerar código de pareamento"}
          </Button>
        </div>
      )}
    </div>
  );
}
