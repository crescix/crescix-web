"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isAuthenticating } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Só redireciona DEPOIS que a verificação do token terminar
    if (!isAuthenticating && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isAuthenticating, router]);

  // Enquanto verifica o token, mostra loading
  if (isAuthenticating) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-primary">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Carregando...</span>
        </div>
      </div>
    );
  }

  // Não autenticado — não renderiza nada (o useEffect já redirecionou)
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
