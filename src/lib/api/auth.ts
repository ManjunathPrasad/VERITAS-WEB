import { apiClient } from "./client";
import type { LoginResponse } from "./types";

export function login(email: string, password: string) {
    return apiClient.post<LoginResponse>("/api/Auth/login", {
        email,
        password,
    });
}
