import { Suspense } from "react";
import { PedidoForm } from "../_components/pedido-form";

export default function NovoPedidoPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-secondary flex items-center justify-center">
          <p className="text-white/30 text-sm">Carregando...</p>
        </div>
      }
    >
      <PedidoForm mode="novo" />
    </Suspense>
  );
}
