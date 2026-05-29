"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle, Clock, Receipt } from "lucide-react";
import {
  PaymentStatusResponse,
  PaymentStatus,
  formatBRL,
  listPayments,
} from "@/services/assinatura";

/**
 * Seção "Histórico de pagamentos" na tela /assinatura.
 *
 * Mostra todos os pagamentos do usuário (até 50 mais recentes).
 * Falha silenciosamente se a API estiver fora — esse card é
 * complementar, não bloqueia o fluxo de pagamento que é o core.
 *
 * Não mostra se o histórico estiver vazio (cliente novo que ainda
 * não pagou) — sem ruído visual desnecessário.
 */
export function PaymentHistory() {
  const [payments, setPayments] = useState<PaymentStatusResponse[] | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    listPayments()
      .then((data) => {
        if (alive) setPayments(data);
      })
      .catch((err) => {
        console.warn("[payment-history] falha ao carregar:", err);
        if (alive) setPayments([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Loading inicial
  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
          <Receipt className="h-5 w-5 text-white/60" />
          Histórico de pagamentos
        </h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-white/40" />
        </div>
      </div>
    );
  }

  // Sem pagamentos → não renderiza nada (não polui a tela do trial)
  if (!payments || payments.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
        <Receipt className="h-5 w-5 text-white/60" />
        Histórico de pagamentos
      </h2>

      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/40 text-xs uppercase tracking-wider border-b border-white/5">
              <th className="px-2 py-2 font-medium">Data</th>
              <th className="px-2 py-2 font-medium">Plano</th>
              <th className="px-2 py-2 font-medium text-right">Valor</th>
              <th className="px-2 py-2 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <PaymentRow key={p.id} payment={p} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentRow({ payment }: { payment: PaymentStatusResponse }) {
  const dateRef = payment.paidAt ?? payment.createdAt;
  const dataFmt = new Date(dateRef).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const planLabel = payment.plan === "MENSAL" ? "Mensal" : "Anual";

  return (
    <tr className="border-b border-white/5 last:border-0">
      <td className="px-2 py-3 text-white/80">{dataFmt}</td>
      <td className="px-2 py-3 text-white/80">{planLabel}</td>
      <td className="px-2 py-3 text-right text-white/90 font-medium">
        {formatBRL(payment.valor)}
      </td>
      <td className="px-2 py-3 text-right">
        <StatusBadge status={payment.status} />
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  if (status === "PAID") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-400">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Pago
      </span>
    );
  }
  if (status === "PENDING") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400">
        <Clock className="h-3.5 w-3.5" />
        Pendente
      </span>
    );
  }
  if (status === "REFUNDED") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-white/60">
        <XCircle className="h-3.5 w-3.5" />
        Estornado
      </span>
    );
  }
  // FAILED
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400">
      <XCircle className="h-3.5 w-3.5" />
      Não aprovado
    </span>
  );
}
