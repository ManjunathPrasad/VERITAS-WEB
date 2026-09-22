import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AUTH_STORAGE_KEY } from "../../lib/api/client";
import * as authApi from "../../lib/api/auth";
import type { LoginResponse } from "../../lib/api/types";
import { AuthContext } from "./authContext";

function readStoredUser(): LoginResponse | null {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as LoginResponse;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<LoginResponse | null>(readStoredUser());

    const login = useCallback(async (email: string, password: string) => {
        const response = await authApi.login(email, password);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(response));
        setUser(response);
        return response;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setUser(null);
    }, []);

    const value = useMemo(
        () => ({ user, login, logout }),
        [user, login, logout],
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}
