import { apiClient } from "./client";
import type { FacultyResponse } from "./types";

export function getAllFaculty() {
    return apiClient.get<FacultyResponse[]>("/api/Faculty");
}

export function getFacultyById(id: string) {
    return apiClient.get<FacultyResponse>(`/api/Faculty/${id}`);
}

export interface CreateFacultyPayload {
    employeeCode: string;
    fullName: string;
    email: string;
    department: string;
    designation: string;
    password?: string;
}

export function createFaculty(payload: CreateFacultyPayload) {
    return apiClient.post<FacultyResponse>("/api/Faculty", payload);
}
