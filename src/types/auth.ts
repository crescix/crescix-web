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

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    phone?: string | null;
    tipoComercio?: TipoComercio | null;
    fotoUrl?: string | null;
    /**
     * Saldo em caixa quando o usuário começou a usar o sistema.
     * Soma como ponto de partida no fluxo de caixa e no card de saldo
     * do dashboard. Default 0 — usuário que não preencher fica neutro.
     */
    saldoInicial?: number;
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

export interface AuthContextData {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isAuthenticating: boolean;
    signIn: (credentials: SignInCredentials) => Promise<void>;
    signUp: (credentials: SignUpCredentials) => Promise<void>;
    signOut: (options?: { redirect?: boolean }) => void;
    /**
     * Aplica um patch parcial sobre o usuário do contexto. Usado por
     * componentes que mexem no perfil (ex.: edição de saldo inicial)
     * pra propagar a mudança sem recarregar a página.
     */
    updateUser: (patch: Partial<UserProfile>) => void;
}
