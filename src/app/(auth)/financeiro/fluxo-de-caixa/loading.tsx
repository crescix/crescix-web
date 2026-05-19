/**
 * Skeleton da tela /financeiro/fluxo-de-caixa. Aparece durante:
 *   - download do chunk JS (componente é "use client")
 *   - hidratação inicial antes do useEffect rodar
 *
 * Imita: 3 cards de resumo no topo, gráfico, filtros, tabela.
 * Sem o loading.tsx o usuário via tela preta por 200-800ms.
 */

function Pulse({ className }: { className: string }) {
  return <div className={`bg-white/5 animate-pulse rounded-md ${className}`} />;
}

export default function FluxoDeCaixaLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <Pulse className="h-7 w-56 mb-2" />
        <Pulse className="h-4 w-80" />
      </div>

      {/* 3 cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 rounded-xl p-5"
          >
            <Pulse className="h-3 w-20 mb-3" />
            <Pulse className="h-7 w-32 mb-2" />
            <Pulse className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Gráfico */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
        <Pulse className="h-4 w-40 mb-4" />
        <Pulse className="h-64 w-full" />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Pulse className="h-9 w-32" />
        <Pulse className="h-9 w-32" />
        <Pulse className="h-9 w-48" />
      </div>

      {/* Tabela */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="border-b border-white/10 p-4">
          <Pulse className="h-4 w-32" />
        </div>
        <div className="divide-y divide-white/5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <Pulse className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Pulse className="h-3 w-1/3" />
                <Pulse className="h-3 w-1/4" />
              </div>
              <Pulse className="h-5 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
