"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated, isAuthenticating } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticating) return;
    if (isAuthenticated) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated, isAuthenticating, router]);

  // Tela de loading enquanto decide para onde vai
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-primary">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-400">Carregando...</span>
      </div>
    </div>
  );
}
