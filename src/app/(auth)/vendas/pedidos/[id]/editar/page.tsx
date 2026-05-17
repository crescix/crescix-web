"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { PedidoForm } from "../../_components/pedido-form";

export default function EditarPedidoPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-secondary flex items-center justify-center">
          <p className="text-white/30 text-sm">Carregando...</p>
        </div>
      }
    >
      <PedidoForm mode="editar" pedidoId={id} />
    </Suspense>
  );
}
