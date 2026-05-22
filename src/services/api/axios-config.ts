import axios from "axios";

const STORAGE_TOKEN_KEY = "@Crescix:token";
const STORAGE_USER_KEY = "@Crescix:user";

/**
 * URL base da crescix-api. Em dev cai pra localhost; em produção,
 * exigimos a env var setada — sem isso, o app silenciosamente tentaria
 * chamar localhost:3333 do navegador do usuário, o pior tipo de falha
 * (nada funciona, sem erro óbvio).
 *
 * A checagem roda no client (typeof window !== "undefined") porque
 * NEXT_PUBLIC_* é embutido em build time. Se a build foi feita sem a
 * env var, o usuário vê um erro claro na primeira request em vez de
 * timeouts misteriosos.
 */
const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

if (
  typeof window !== "undefined" &&
  !NEXT_PUBLIC_API_URL &&
  process.env.NODE_ENV === "production"
) {
  // Loga no console — vai aparecer no DevTools do usuário. Não conseguimos
  // mostrar tela de erro aqui (root layout do Next já renderizou), mas
  // pelo menos o motivo do colapso fica visível pra quem investigar.
  console.error(
    "[crescix-web] NEXT_PUBLIC_API_URL não está configurada. " +
      "O app não vai conseguir conversar com a crescix-api. " +
      "Defina essa variável no deploy (ex.: https://api.crescix.com.br)."
  );
}

const api = axios.create({
  baseURL: NEXT_PUBLIC_API_URL || "http://localhost:3333",
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

    // ─── 402 Payment Required → assinatura expirada ──────────────────
    // O middleware requireActiveSubscription na API devolve 402 em
    // tentativas de escrita quando o usuário está EXPIRED/CANCELED.
    // Em vez de mostrar toast genérico, mandamos pra /assinatura.
    // Mantemos a rejeição da promise pra que o caller ainda possa
    // tratar (ex.: parar o spinner).
    if (status === 402 && !isAuthEndpoint) {
      if (
        window.location.pathname !== "/assinatura" &&
        window.location.pathname !== "/login"
      ) {
        window.location.href = "/assinatura";
      }
    }

    return Promise.reject(error);
  }
);

export { api, STORAGE_TOKEN_KEY, STORAGE_USER_KEY };
