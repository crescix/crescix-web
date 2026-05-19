/**
 * 404 do App Router. Disparado automaticamente quando:
 *   - usuário acessa uma rota que não existe
 *   - código chama `notFound()` (ex.: registro com ID inexistente)
 *
 * Tom: leve, sem culpar o usuário, com saída clara pra navegação.
 */

import Link from "next/link";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B1622] flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-green/10 border border-brand-green/20 mb-6">
          <Compass className="w-8 h-8 text-brand-green" />
        </div>

        <div className="text-7xl font-black tracking-tighter mb-2 bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
          404
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">
          Página não encontrada
        </h1>
        <p className="text-white/60 text-sm leading-relaxed">
          A rota que você tentou acessar não existe — talvez tenha mudado de
          lugar ou nunca tenha existido. Sem stress, dá pra voltar pelo botão
          abaixo.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 bg-brand-green hover:bg-brand-green/90 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors mt-8"
        >
          <Home className="w-4 h-4" />
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
