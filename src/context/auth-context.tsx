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
  SignUpResponse,
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
  // O backend cria a conta mas NÃO retorna token — exige que o cliente
  // confirme o e-mail antes de logar. Não auto-logamos aqui. A tela
  // /cadastro recebe a resposta e redireciona pra /login mostrando
  // instruções de "verifique seu e-mail".
  async function signUp(data: SignUpCredentials): Promise<SignUpResponse> {
    try {
      const response = await api.post<SignUpResponse>("/auth/signup", data);
      return response.data;
    } catch (err) {
      throw new Error(
        extractApiError(err, "Não consegui criar a conta agora. Tente novamente.")
      );
    }
  }

  // ─── Sign Out ────────────────────────────────────────────────────────────
  // `redirect: false` é útil quando a chamada vem de uma página pública
  // (cadastro, esqueci-senha) só pra limpar sessão pendente — sem isso,
  // o cadastro entra em loop: monta → signOut → push("/login") → monta
  // /login → mas o usuário queria estar em /cadastro.
  function signOut(options: { redirect?: boolean } = {}) {
    const { redirect = true } = options;
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    setUser(null);
    if (redirect) router.push("/login");
  }

  // ─── Update user (after PATCH /auth/me) ──────────────────────────────────
  // Permite componentes que mexem no perfil (ex.: edição de saldo inicial)
  // propagarem a mudança sem precisar recarregar a página. Aceita o
  // payload completo retornado pela API ou um patch parcial.
  function updateUser(patch: Partial<UserProfile>) {
    setUser((current) => {
      if (!current) return current;
      const merged = { ...current, ...patch };
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(merged));
      return merged;
    });
  }

  const contextValue: AuthContextData = {
    user,
    isAuthenticated,
    isAuthenticating,
    signIn,
    signOut,
    signUp,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
