import { apiClient } from "./client";
import type { DashboardSummary } from "./types";

export function getDashboardSummary() {
    return apiClient.get<DashboardSummary>("/api/Dashboard/summary");
}

export function processEscalations() {
    return apiClient.post<{ message: string }>("/api/Escalation/process");
}
