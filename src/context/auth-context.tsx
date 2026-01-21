"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/api/axios-config";
import { AuthContextData, SignInCredentials, UserProfile, SignUpCredentials } from "@/types/auth";

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  useEffect(() => {
    const storedToken = localStorage.getItem("@Crescix:token");
    const storedUser = localStorage.getItem("@Crescix:user");

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      } catch (error) {
        localStorage.clear();
      }
    }
    
    setIsAuthenticating(false);
  }, []);

  async function signIn({ email, password }: SignInCredentials) {
    const response = await api.post("/sessions", { email, password });
    const { token, user: userData } = response.data;

    localStorage.setItem("@Crescix:token", token);
    localStorage.setItem("@Crescix:user", JSON.stringify(userData));

    setUser(userData);
    router.push("/dashboard");
  }

  async function signUp(data: SignUpCredentials) {
    await api.post("/users", data);
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
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);