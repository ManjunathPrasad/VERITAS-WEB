import { apiClient } from "./client";
import type { StudentDto } from "./types";

export function getAllStudents() {
    return apiClient.get<StudentDto[]>("/api/Students");
}

export function getStudentById(id: string) {
    return apiClient.get<StudentDto>(`/api/Students/${id}`);
}

export interface CreateStudentPayload {
    usn: string;
    name: string;
    email: string;
    phoneNumber: string;
    department: string;
    semester: number;
    section: string;
    password?: string;
}

export function createStudent(payload: CreateStudentPayload) {
    return apiClient.post<string>("/api/Students", payload);
}
