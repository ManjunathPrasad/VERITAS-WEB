import { apiClient } from "./client";
import type { AttendanceDto } from "./types";

export function getAttendanceByStudent(studentId: string) {
    return apiClient.get<AttendanceDto[]>(
        `/api/Attendance/student/${studentId}`,
    );
}

export function getAllAttendance() {
    return apiClient.get<AttendanceDto[]>("/api/Attendance");
}
