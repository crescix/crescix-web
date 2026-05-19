import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className="
        min-h-screen w-full
        flex flex-col items-center
        bg-app
      "
    >
      {/* Conteúdo principal — o que cada página renderiza */}
      <div className="flex-1 w-full flex flex-col items-center justify-center p-0 md:p-6">
        {children}
      </div>

      {/* Rodapé legal — sempre visível, fora do card de login/cadastro.
          Aparece em /login, /cadastro, /esqueci-senha, /redefinir-senha,
          /privacidade e /termos. */}
      <footer className="w-full text-center py-6 px-4 text-xs text-white/35">
        <nav className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/privacidade"
            className="hover:text-white/70 transition-colors"
          >
            Privacidade
          </Link>
          <span aria-hidden="true" className="text-white/15">·</span>
          <Link
            href="/termos"
            className="hover:text-white/70 transition-colors"
          >
            Termos de uso
          </Link>
          <span aria-hidden="true" className="text-white/15">·</span>
          <a
            href="mailto:privacidade@crescix.com.br"
            className="hover:text-white/70 transition-colors"
          >
            DPO
          </a>
        </nav>
        <p className="mt-2 text-white/25">
          © {new Date().getFullYear()} CrescIX. Feito em Santa Rita do Sapucaí, MG.
        </p>
      </footer>
    </main>
  );
}
