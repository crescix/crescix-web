import axios from "axios";

const STORAGE_TOKEN_KEY = "@Crescix:token";
const STORAGE_USER_KEY = "@Crescix:user";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333",
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request: injeta Bearer token automaticamente ──────────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const userToken = localStorage.getItem(STORAGE_TOKEN_KEY);
    if (userToken && config.headers) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }
  }
  return config;
});

// ─── Response: 401 em rota autenticada → logout automático ─────────────────
// Importante: NÃO autodesloga se o 401 veio de /auth/login ou /auth/signup
// (são erros esperados de credenciais inválidas, devem propagar pra UI).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window === "undefined") return Promise.reject(error);

    const status = error.response?.status;
    const url: string = error.config?.url || "";
    const isAuthEndpoint =
      url.includes("/auth/login") || url.includes("/auth/signup");

    // Só auto-desloga se:
    //   - status 401
    //   - request NÃO é login/signup
    //   - havia token (usuário se achava autenticado)
    if (status === 401 && !isAuthEndpoint) {
      const hadToken = !!localStorage.getItem(STORAGE_TOKEN_KEY);
      if (hadToken) {
        localStorage.removeItem(STORAGE_TOKEN_KEY);
        localStorage.removeItem(STORAGE_USER_KEY);
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export { api, STORAGE_TOKEN_KEY, STORAGE_USER_KEY };
