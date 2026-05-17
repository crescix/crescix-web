"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  api,
  STORAGE_TOKEN_KEY,
  STORAGE_USER_KEY,
} from "@/services/api/axios-config";
import { extractApiError } from "@/lib/utils/api-errors";
import {
  AuthContextData,
  AuthResponse,
  SignInCredentials,
  SignUpCredentials,
  UserProfile,
} from "@/types/auth";

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // ─── Restore session on mount ────────────────────────────────────────────
  // Se há token no localStorage, valida com a API (GET /auth/me).
  // Se falhar (token expirado/inválido), limpa o storage silenciosamente.
  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY);

    if (!storedToken) {
      setIsAuthenticating(false);
      return;
    }

    api
      .get<UserProfile>("/auth/me")
      .then((response) => {
        setUser(response.data);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(response.data));
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_TOKEN_KEY);
        localStorage.removeItem(STORAGE_USER_KEY);
        setUser(null);
      })
      .finally(() => {
        setIsAuthenticating(false);
      });
  }, []);

  // ─── Sign In ─────────────────────────────────────────────────────────────
  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
      });
      const { token, user: userData } = response.data;

      localStorage.setItem(STORAGE_TOKEN_KEY, token);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData));
      setUser(userData);
      router.push("/dashboard");
    } catch (err) {
      throw new Error(
        extractApiError(err, "E-mail ou senha incorretos.")
      );
    }
  }

  // ─── Sign Up ─────────────────────────────────────────────────────────────
  // O backend retorna { token, user } já no signup → faz auto-login.
  async function signUp(data: SignUpCredentials) {
    try {
      const response = await api.post<AuthResponse>("/auth/signup", data);
      const { token, user: userData } = response.data;

      localStorage.setItem(STORAGE_TOKEN_KEY, token);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData));
      setUser(userData);
      router.push("/dashboard");
    } catch (err) {
      throw new Error(
        extractApiError(err, "Erro ao criar conta. Tente novamente.")
      );
    }
  }

  // ─── Sign Out ────────────────────────────────────────────────────────────
  function signOut() {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
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
