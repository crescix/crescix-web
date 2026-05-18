"use client";

import { useEffect } from "react";

/**
 * Avisa o usuário se ele tentar fechar a aba ou recarregar a página
 * com alterações não-salvas.
 *
 * Limitação: o `beforeunload` só cobre fechar aba/refresh/navegar pra
 * fora do domínio. Navegação interna no Next (Link/router.push) não
 * dispara — pra interceptar isso, teríamos que mexer no router (mais
 * intrusivo). A maioria dos casos práticos de perda de dado é fechar
 * a aba sem querer, então o `beforeunload` cobre ~80% dos cenários.
 *
 * Uso:
 *   useUnsavedChanges(isDirty);
 */
export function useUnsavedChanges(when: boolean, message?: string): void {
  useEffect(() => {
    if (!when) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Browsers modernos ignoram a mensagem customizada e mostram a deles,
      // mas o returnValue é necessário pro prompt aparecer.
      e.returnValue = message ?? "Você tem alterações não salvas. Deseja sair mesmo assim?";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [when, message]);
}
