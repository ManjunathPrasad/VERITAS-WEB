import { apiClient } from "./client";
import type { LeaveDocument, VerifyDocumentResponse } from "./types";

export function getDocumentsByLeaveRequest(leaveRequestId: string) {
    return apiClient.get<LeaveDocument[]>(
        `/api/LeaveDocument/leave/${leaveRequestId}`,
    );
}

export function uploadLeaveDocument(leaveRequestId: string, file: File) {
    const formData = new FormData();
    formData.append("LeaveRequestId", leaveRequestId);
    formData.append("File", file);

    return apiClient.upload<LeaveDocument>(
        "/api/LeaveDocument/upload",
        formData,
    );
}

export function verifyLeaveDocument(documentId: string) {
    return apiClient.post<VerifyDocumentResponse>(
        `/api/LeaveDocument/${documentId}/verify`,
    );
}

export async function downloadLeaveDocument(
    documentId: string,
    fileName: string,
) {
    const blob = await apiClient.downloadBlob(
        `/api/LeaveDocument/${documentId}/download`,
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
}
