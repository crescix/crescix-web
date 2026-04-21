"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api/axios-config";
import { AuthContextData, SignInCredentials, UserProfile, SignUpCredentials } from "@/types/auth";

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// ─── Usuários mock para testar sem backend ────────────────────────────────────
const MOCK_USERS = [
  { id: "1", name: "Thiago", email: "thiago@crescix.com", password: "123456" },
  { id: "2", name: "Admin", email: "admin@crescix.com",   password: "admin123" },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  useEffect(() => {
    const storedToken = localStorage.getItem("@Crescix:token");
    const storedUser  = localStorage.getItem("@Crescix:user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      } catch {
        localStorage.clear();
      }
    }

    setIsAuthenticating(false);
  }, []);

  async function signIn({ email, password }: SignInCredentials) {
    // ── MOCK: simula autenticação sem backend ──────────────────────────────────
    // Quando o backend estiver pronto, substitua este bloco por:
    // const response = await api.post("/sessions", { email, password });
    // const { token, user: userData } = response.data;

    const mockUser = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (!mockUser) {
      throw new Error("Email ou senha inválidos.");
    }

    const { password: _, ...userData } = mockUser;
    const token = `mock-token-${userData.id}-${Date.now()}`;

    // ─────────────────────────────────────────────────────────────────────────

    localStorage.setItem("@Crescix:token", token);
    localStorage.setItem("@Crescix:user", JSON.stringify(userData));

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData as UserProfile);
    router.push("/dashboard");
  }

  async function signUp(data: SignUpCredentials) {
    // ── MOCK: simula cadastro sem backend ──────────────────────────────────────
    // Quando o backend estiver pronto, substitua por:
    // await api.post("/users", data);
    console.log("Mock signUp:", data);
    // ─────────────────────────────────────────────────────────────────────────
    router.push("/login");
  }

  function signOut() {
    localStorage.removeItem("@Crescix:token");
    localStorage.removeItem("@Crescix:user");
    setUser(null);
    router.push("/login");
  }

  const contextValue: AuthContextData = {
    user,
    isAuthenticated,
    isAuthenticating,
    signIn,
    signOut,
    signUp,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
