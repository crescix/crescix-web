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
}
