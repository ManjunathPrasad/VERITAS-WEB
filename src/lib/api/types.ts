export type Role = "Student" | "Faculty" | "HOD" | "Admin";

export const LeaveStatus = {
    PendingFaculty: 1,
    ApprovedByFaculty: 2,
    RejectedByFaculty: 3,
    EscalatedToHod: 4,
    ApprovedByHod: 5,
    RejectedByHod: 6,
} as const;

export type LeaveStatusValue = (typeof LeaveStatus)[keyof typeof LeaveStatus];

export const LeaveStatusLabels: Record<LeaveStatusValue, string> = {
    1: "Pending Faculty Review",
    2: "Approved by Faculty",
    3: "Rejected by Faculty",
    4: "Escalated to HOD",
    5: "Approved by HOD",
    6: "Rejected by HOD",
};

export const AttendanceStatus = {
    Present: 1,
    Absent: 2,
} as const;

export type AttendanceStatusValue =
    (typeof AttendanceStatus)[keyof typeof AttendanceStatus];

export interface LoginResponse {
    token: string;
    userId: string;
    fullName: string;
    email: string;
    role: Role;
    studentId: string | null;
    facultyId: string | null;
}

export interface StudentDto {
    id: string;
    usn: string;
    name: string;
    email: string;
    department: string;
    semester: number;
    section: string;
    attendancePercentage: number;
}

export interface FacultyResponse {
    id: string;
    employeeCode: string;
    fullName: string;
    email: string;
    department: string;
    designation: string;
    isActive: boolean;
}

export interface AttendanceDto {
    id: string;
    studentId: string;
    attendanceDate: string;
    status: AttendanceStatusValue;
    source: string;
    syncedAtUtc: string;
}

export interface LeaveRequestResponse {
    id: string;
    studentId: string;
    facultyId: string;
    hodId: string | null;
    fromDate: string;
    toDate: string;
    reason: string;
    status: LeaveStatusValue;
    facultyRemarks: string;
    hodRemarks: string;
}

export interface LeaveDocument {
    id: string;
    leaveRequestId: string;
    fileName: string;
    filePath: string;
    contentType: string;
    fileSize: number;
    isVerified: boolean;
    verificationScore: number;
}

export interface VerifyDocumentResponse {
    documentId: string;
    isVerified: boolean;
    verificationScore: number;
    remarks: string;
}

export interface NotificationDto {
    id: string;
    studentId: string;
    facultyId: string | null;
    hodId: string | null;
    title: string;
    message: string;
    isSent: boolean;
    sentAtUtc: string;
    readAtUtc: string | null;
}

export interface DashboardSummary {
    totalStudents: number;
    totalFaculty: number;
    pendingFacultyLeaves: number;
    approvedLeaves: number;
    rejectedLeaves: number;
    documentsUploaded: number;
    verifiedDocuments: number;
    notifications: number;
}
