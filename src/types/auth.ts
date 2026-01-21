export interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone?: string;
}

export interface SignInCredentials {
    email: string;
    password?: string;
}

export interface SignUpCredentials {
    name: string;
    email: string;
    phone: string;
    password?: string;
}

export interface AuthContextData {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isAuthenticating: boolean;
    signIn: (credentials: SignInCredentials) => Promise<void>;
    signUp: (credentials: SignUpCredentials) => Promise<void>;
    signOut: () => void;
}