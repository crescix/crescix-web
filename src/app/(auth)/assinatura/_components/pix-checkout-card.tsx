"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Loader2, QrCode, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CriarPixResponse,
  PaymentStatus,
  formatBRL,
  getPaymentStatus,
} from "@/services/assinatura";

interface PixCheckoutCardProps {
  pix: CriarPixResponse;
  /** Chamado quando o pagamento for confirmado (status === 'PAID'). */
  onPaid: () => void;
  /** Chamado quando o usuário clicar em "gerar novo PIX". */
  onRegenerate: () => void;
}

/**
 * Card do checkout PIX: QR Code (imagem base64), copia-e-cola, timer
 * de expiração e polling do status no backend.
 *
 * Polling estratégia:
 *   - A cada 4s enquanto status = PENDING
 *   - Para imediatamente quando vira PAID/FAILED ou QR expira
 *   - Sem retry de erro: se a request falha (rede caiu), o próximo
 *     tick tenta de novo. UX continua.
 */
export function PixCheckoutCard({
  pix,
  onPaid,
  onRegenerate,
}: PixCheckoutCardProps) {
  const [status, setStatus] = useState<PaymentStatus>("PENDING");
  const [copied, setCopied] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(
      0,
      Math.floor((new Date(pix.expiresAt).getTime() - Date.now()) / 1000)
    )
  );

  // ── Polling de status ────────────────────────────────────────────────────
  useEffect(() => {
    if (status !== "PENDING") return;
    if (secondsLeft <= 0) return;

    const interval = setInterval(async () => {
      try {
        const data = await getPaymentStatus(pix.paymentId);
        setStatus(data.status);
        if (data.status === "PAID") {
          // Pequena espera pra o usuário ver o "Confirmado" antes
          // da transição.
          setTimeout(onPaid, 800);
        }
      } catch (err) {
        // Silencioso de propósito — o próximo tick tenta de novo.
        // Não vale poluir a UI com toast a cada hiccup de rede.
        console.warn("[pix-checkout] polling falhou:", err);
      }
    }, 4_000);

    return () => clearInterval(interval);
  }, [pix.paymentId, status, secondsLeft, onPaid]);

  // ── Countdown do QR ───────────────────────────────────────────────────────
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1_000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(pix.qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Falha ao copiar:", err);
    }
  }

  const expired = secondsLeft <= 0;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timer = minutes + ":" + seconds.toString().padStart(2, "0");

  // ── Estados terminais ─────────────────────────────────────────────────────
  if (status === "PAID") {
    return (
      <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
          <Check className="h-8 w-8 text-green-400" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-white">
          Pagamento confirmado!
        </h2>
        <p className="mt-2 text-sm text-white/70">
          Sua assinatura foi ativada. Redirecionando...
        </p>
      </div>
    );
  }

  if (status === "FAILED" || expired) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
        <h2 className="text-xl font-semibold text-white">
          {expired ? "QR Code expirado" : "Pagamento não aprovado"}
        </h2>
        <p className="mt-2 text-sm text-white/70">
          {expired
            ? "Esse PIX já passou do prazo. Gere um novo pra continuar."
            : "Algo deu errado com a cobrança. Tente novamente."}
        </p>
        <Button onClick={onRegenerate} className="mt-6" variant="default">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Gerar novo PIX
        </Button>
      </div>
    );
  }

  // ── Tela principal: QR ativo ──────────────────────────────────────────────
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Pagar com PIX</h2>
          <p className="mt-1 text-sm text-white/60">
            Plano {pix.plan === "MENSAL" ? "Mensal" : "Anual"} ·{" "}
            <span className="text-brand-green">{formatBRL(pix.valor)}</span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider text-white/40">
            Expira em
          </div>
          <div className="font-mono text-lg font-semibold text-white">
            {timer}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[auto,1fr] md:items-start">
        {/* QR Code */}
        <div className="mx-auto rounded-xl bg-white p-3 md:mx-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={"data:image/png;base64," + pix.qrCodeBase64}
            alt="QR Code PIX"
            className="h-56 w-56 md:h-64 md:w-64"
          />
        </div>

        {/* Instruções + copia-e-cola */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Como pagar</h3>
            <ol className="mt-2 space-y-1 text-sm text-white/70">
              <li>1. Abra o app do seu banco</li>
              <li>2. Escolha pagar com PIX → ler QR Code</li>
              <li>3. Aponte a câmera pro código ao lado</li>
              <li>4. Ou copie o código abaixo e cole em &ldquo;PIX Copia e Cola&rdquo;</li>
            </ol>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-white/40">
              PIX Copia e Cola
            </label>
            <div className="mt-1 flex gap-2">
              <code className="flex-1 truncate rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs text-white/80">
                {pix.qrCode}
              </code>
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="mr-1 h-4 w-4" /> Copiado
                  </>
                ) : (
                  <>
                    <Copy className="mr-1 h-4 w-4" /> Copiar
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-white/5 p-3 text-xs text-white/60">
            <Loader2 className="h-3 w-3 animate-spin text-brand-green" />
            <span>
              Aguardando confirmação do banco. Pode levar até 30s depois de pagar.
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/40">
        <span className="flex items-center gap-2">
          <QrCode className="h-3 w-3" />
          ID: {pix.paymentId.slice(0, 8)}
        </span>
        <button onClick={onRegenerate} className="text-white/60 hover:text-white">
          Gerar novo PIX
        </button>
      </div>
    </div>
  );
}
