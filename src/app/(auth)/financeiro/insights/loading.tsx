/**
 * Skeleton da tela /financeiro/insights. Tela pesada que faz duas
 * chamadas (agregado + sugestões IA), pode levar 1-3s — sem skeleton
 * dava tela preta nesse intervalo.
 */

function Pulse({ className }: { className: string }) {
  return <div className={`bg-white/5 animate-pulse rounded-md ${className}`} />;
}

export default function InsightsLoading() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6">
      {/* Header com badge IA */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Pulse className="h-7 w-64 mb-2" />
          <Pulse className="h-4 w-96" />
        </div>
        <Pulse className="h-9 w-32" />
      </div>

      {/* KPIs do mês */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 rounded-xl p-5"
          >
            <Pulse className="h-3 w-16 mb-3" />
            <Pulse className="h-7 w-28 mb-2" />
            <Pulse className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Sugestões IA */}
      <div className="bg-gradient-to-br from-brand-green/10 to-transparent border border-brand-green/20 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Pulse className="h-5 w-5 rounded-full" />
          <Pulse className="h-5 w-40" />
        </div>
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-lg p-4"
            >
              <Pulse className="h-4 w-3/4 mb-2" />
              <Pulse className="h-3 w-full mb-1" />
              <Pulse className="h-3 w-5/6" />
            </div>
          ))}
        </div>
      </div>

      {/* Top categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 rounded-xl p-5"
          >
            <Pulse className="h-4 w-40 mb-4" />
            <div className="space-y-3">
              {[0, 1, 2].map((j) => (
                <div key={j} className="flex items-center justify-between">
                  <Pulse className="h-3 w-32" />
                  <Pulse className="h-3 w-16" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
