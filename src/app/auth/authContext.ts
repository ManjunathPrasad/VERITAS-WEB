import { createContext } from "react";
import type { LoginResponse } from "../../lib/api/types";

export interface AuthContextValue {
    user: LoginResponse | null;
    login: (email: string, password: string) => Promise<LoginResponse>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
    undefined,
);
