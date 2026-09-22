import { apiClient } from "./client";
import type { NotificationDto } from "./types";

export function getNotificationsByStudent(studentId: string) {
    return apiClient.get<NotificationDto[]>(
        `/api/Notification/student/${studentId}`,
    );
}
