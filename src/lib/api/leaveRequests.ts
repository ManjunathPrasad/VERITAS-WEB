import { apiClient } from "./client";
import type { LeaveRequestResponse } from "./types";

export function getAllLeaveRequests() {
    return apiClient.get<LeaveRequestResponse[]>("/api/LeaveRequest");
}

export function getLeaveRequestsByStudent(studentId: string) {
    return apiClient.get<LeaveRequestResponse[]>(
        `/api/LeaveRequest/student/${studentId}`,
    );
}

export interface CreateLeaveRequestPayload {
    studentId: string;
    facultyId: string;
    fromDate: string;
    toDate: string;
    reason: string;
}

export function createLeaveRequest(payload: CreateLeaveRequestPayload) {
    return apiClient.post<LeaveRequestResponse>(
        "/api/LeaveRequest",
        payload,
    );
}

export function facultyReview(
    leaveId: string,
    isApproved: boolean,
    remarks: string,
) {
    return apiClient.put<LeaveRequestResponse>(
        `/api/LeaveRequest/${leaveId}/faculty-review`,
        { isApproved, remarks },
    );
}

export function hodReview(
    leaveId: string,
    isApproved: boolean,
    remarks: string,
) {
    return apiClient.put<LeaveRequestResponse>(
        `/api/LeaveRequest/${leaveId}/hod-review`,
        { isApproved, remarks },
    );
}
