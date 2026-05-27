export type TipoComercio =
    | "VAREJO"
    | "ATACADO"
    | "RESTAURANTE"
    | "BAR_CAFETERIA"
    | "MERCADO"
    | "PADARIA"
    | "ACOUGUE"
    | "BELEZA"
    | "MODA"
    | "CALCADOS"
    | "PET_SHOP"
    | "FARMACIA"
    | "SAUDE"
    | "EDUCACAO"
    | "TECNOLOGIA"
    | "CONSTRUCAO"
    | "AUTOMOTIVO"
    | "POSTO_COMBUSTIVEL"
    | "SERVICOS"
    | "OUTRO";

export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "EXPIRED" | "CANCELED";

export interface SubscriptionInfo {
    status: SubscriptionStatus;
    trialEndsAt: string | null;
    subscriptionEndsAt: string | null;
    /** Dias inteiros restantes (0 quando já venceu). */
    daysRemaining: number;
}

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    /**
     * Se o cliente já clicou no link de confirmação enviado por e-mail.
     * Cliente pode usar o app sem confirmar, mas vê banner pedindo.
     * Default false em novos cadastros.
     */
    emailVerified?: boolean;
    phone?: string | null;
    tipoComercio?: TipoComercio | null;
    fotoUrl?: string | null;
    /**
     * Saldo em caixa quando o usuário começou a usar o sistema.
     * Soma como ponto de partida no fluxo de caixa e no card de saldo
     * do dashboard. Default 0 — usuário que não preencher fica neutro.
     */
    saldoInicial?: number;
    /**
     * Bloco de assinatura exposto pela API em /auth/me, /auth/login e
     * /auth/signup. O `status` é calculado dinamicamente no backend
     * comparando as datas — confie nele em vez de recalcular no cliente.
     */
    subscription?: SubscriptionInfo;
    createdAt?: string;
    updatedAt?: string;
}

export interface SignInCredentials {
    email: string;
    password: string;
}

export interface SignUpCredentials {
    name: string;
    email: string;
    phone?: string;
    password: string;
    tipoComercio?: TipoComercio;
}

export interface AuthResponse {
    token: string;
    user: UserProfile;
}

/**
 * Resposta do POST /auth/signup. **Não inclui token JWT** — o backend
 * agora exige que o cliente confirme o e-mail antes de autenticar.
 * O front recebe essa resposta e redireciona pra /login com instruções.
 */
export interface SignUpResponse {
    message: string;
    requiresVerification: boolean;
    email: string;
}

export interface AuthContextData {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isAuthenticating: boolean;
    signIn: (credentials: SignInCredentials) => Promise<void>;
    signUp: (credentials: SignUpCredentials) => Promise<SignUpResponse>;
    signOut: (options?: { redirect?: boolean }) => void;
    /**
     * Aplica um patch parcial sobre o usuário do contexto. Usado por
     * componentes que mexem no perfil (ex.: edição de saldo inicial)
     * pra propagar a mudança sem recarregar a página.
     */
    updateUser: (patch: Partial<UserProfile>) => void;
}
