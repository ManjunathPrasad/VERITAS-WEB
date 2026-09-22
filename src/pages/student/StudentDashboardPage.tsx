import { useEffect, useState, useCallback } from "react";
import type { FormEvent } from "react";
import TopBar from "../../components/common/TopBar";
import ErrorBanner from "../../components/common/ErrorBanner";
import StatusBadge from "../../components/common/StatusBadge";
import { useAuth } from "../../app/auth/useAuth";
import { getStudentById } from "../../lib/api/students";
import { getAttendanceByStudent } from "../../lib/api/attendance";
import {
    createLeaveRequest,
    getLeaveRequestsByStudent,
} from "../../lib/api/leaveRequests";
import { getAllFaculty } from "../../lib/api/faculty";
import { getNotificationsByStudent } from "../../lib/api/notifications";
import {
    downloadLeaveDocument,
    getDocumentsByLeaveRequest,
    uploadLeaveDocument,
    verifyLeaveDocument,
} from "../../lib/api/leaveDocuments";
import type {
    AttendanceDto,
    FacultyResponse,
    LeaveDocument,
    LeaveRequestResponse,
    NotificationDto,
    StudentDto,
} from "../../lib/api/types";
import { AttendanceStatus } from "../../lib/api/types";

function LeaveDocuments({ leaveRequestId }: { leaveRequestId: string }) {
    const [documents, setDocuments] = useState<LeaveDocument[]>([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setDocuments(await getDocumentsByLeaveRequest(leaveRequestId));
    }, [leaveRequestId]);

    useEffect(() => {
        load().catch(() => setError("Could not load documents."));
    }, [load]);

    async function handleUpload(event: FormEvent<HTMLInputElement>) {
        const file = event.currentTarget.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);
        try {
            await uploadLeaveDocument(leaveRequestId, file);
            await load();
        } catch {
            setError("Upload failed. Please try again.");
        } finally {
            setUploading(false);
            event.currentTarget.value = "";
        }
    }

    async function handleVerify(documentId: string) {
        try {
            await verifyLeaveDocument(documentId);
            await load();
        } catch {
            setError("Verification failed.");
        }
    }

    return (
        <div className="mt-3 border-t border-slate-100 pt-3">
            <ErrorBanner message={error} />

            <ul className="space-y-2">
                {documents.map((doc) => (
                    <li
                        key={doc.id}
                        className="flex items-center justify-between text-sm bg-slate-50 rounded-lg px-3 py-2"
                    >
                        <button
                            onClick={() =>
                                downloadLeaveDocument(doc.id, doc.fileName)
                            }
                            className="text-blue-800 hover:underline text-left"
                        >
                            {doc.fileName}
                        </button>

                        <div className="flex items-center gap-2">
                            {doc.isVerified ? (
                                <span className="text-green-700 font-medium">
                                    Verified ({doc.verificationScore}%)
                                </span>
                            ) : (
                                <button
                                    onClick={() => handleVerify(doc.id)}
                                    className="text-xs px-2 py-1 rounded bg-slate-200 hover:bg-slate-300"
                                >
                                    Verify
                                </button>
                            )}
                        </div>
                    </li>
                ))}

                {documents.length === 0 && (
                    <li className="text-sm text-slate-400">
                        No supporting documents uploaded yet.
                    </li>
                )}
            </ul>

            <label className="mt-2 inline-block text-sm text-blue-800 cursor-pointer hover:underline">
                {uploading ? "Uploading…" : "+ Upload supporting document"}
                <input
                    type="file"
                    className="hidden"
                    onChange={handleUpload}
                    disabled={uploading}
                />
            </label>
        </div>
    );
}

export default function StudentDashboardPage() {
    const { user } = useAuth();
    const studentId = user?.studentId ?? "";

    const [student, setStudent] = useState<StudentDto | null>(null);
    const [attendance, setAttendance] = useState<AttendanceDto[]>([]);
    const [leaves, setLeaves] = useState<LeaveRequestResponse[]>([]);
    const [faculty, setFaculty] = useState<FacultyResponse[]>([]);
    const [notifications, setNotifications] = useState<NotificationDto[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const [facultyId, setFacultyId] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const loadAll = useCallback(async () => {
        if (!studentId) return;

        const [studentData, attendanceData, leaveData, facultyData, notifData] =
            await Promise.all([
                getStudentById(studentId),
                getAttendanceByStudent(studentId),
                getLeaveRequestsByStudent(studentId),
                getAllFaculty(),
                getNotificationsByStudent(studentId),
            ]);

        setStudent(studentData);
        setAttendance(attendanceData);
        setLeaves(leaveData);
        setFaculty(facultyData);
        setNotifications(notifData);
    }, [studentId]);

    useEffect(() => {
        loadAll()
            .catch(() => setError("Could not load your dashboard data."))
            .finally(() => setLoading(false));
    }, [loadAll]);

    async function handleApplyLeave(event: FormEvent) {
        event.preventDefault();
        setFormError(null);

        if (!facultyId || !fromDate || !toDate || !reason) {
            setFormError("Please fill in all fields.");
            return;
        }

        setSubmitting(true);
        try {
            await createLeaveRequest({
                studentId,
                facultyId,
                fromDate,
                toDate,
                reason,
            });
            setFromDate("");
            setToDate("");
            setReason("");
            setFacultyId("");
            await loadAll();
        } catch {
            setFormError(
                "Could not submit leave request. You may have exceeded the semester leave limit.",
            );
        } finally {
            setSubmitting(false);
        }
    }

    const presentDays = attendance.filter(
        (a) => a.status === AttendanceStatus.Present,
    ).length;

    return (
        <div className="min-h-screen bg-slate-100">
            <TopBar />

            <div className="max-w-6xl mx-auto px-6 py-8">
                <ErrorBanner message={error} />

                {loading ? (
                    <p className="text-slate-500">Loading…</p>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white rounded-2xl shadow p-6">
                                <h2 className="font-semibold text-lg mb-4">
                                    My Profile
                                </h2>
                                {student && (
                                    <dl className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <dt className="text-slate-500">USN</dt>
                                            <dd className="font-medium">
                                                {student.usn}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-slate-500">
                                                Department
                                            </dt>
                                            <dd className="font-medium">
                                                {student.department}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-slate-500">
                                                Semester / Section
                                            </dt>
                                            <dd className="font-medium">
                                                {student.semester} / {student.section}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-slate-500">
                                                Attendance
                                            </dt>
                                            <dd className="font-medium">
                                                {student.attendancePercentage}%
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-slate-500">
                                                Recorded present days
                                            </dt>
                                            <dd className="font-medium">
                                                {presentDays} / {attendance.length}
                                            </dd>
                                        </div>
                                    </dl>
                                )}
                            </div>

                            <div className="bg-white rounded-2xl shadow p-6">
                                <h2 className="font-semibold text-lg mb-4">
                                    Notifications
                                </h2>
                                <ul className="space-y-3">
                                    {notifications.map((n) => (
                                        <li
                                            key={n.id}
                                            className="text-sm border-b border-slate-100 pb-2 last:border-0"
                                        >
                                            <p className="font-medium">{n.title}</p>
                                            <p className="text-slate-500">
                                                {n.message}
                                            </p>
                                        </li>
                                    ))}
                                    {notifications.length === 0 && (
                                        <li className="text-sm text-slate-400">
                                            No notifications yet.
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl shadow p-6">
                                <h2 className="font-semibold text-lg mb-4">
                                    Apply for Leave
                                </h2>
                                <ErrorBanner message={formError} />
                                <form
                                    onSubmit={handleApplyLeave}
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                                >
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Faculty
                                        </label>
                                        <select
                                            value={facultyId}
                                            onChange={(e) =>
                                                setFacultyId(e.target.value)
                                            }
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                        >
                                            <option value="">
                                                Select faculty
                                            </option>
                                            {faculty.map((f) => (
                                                <option key={f.id} value={f.id}>
                                                    {f.fullName} ({f.designation})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            From
                                        </label>
                                        <input
                                            type="date"
                                            value={fromDate}
                                            onChange={(e) =>
                                                setFromDate(e.target.value)
                                            }
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            To
                                        </label>
                                        <input
                                            type="date"
                                            value={toDate}
                                            onChange={(e) =>
                                                setToDate(e.target.value)
                                            }
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Reason
                                        </label>
                                        <textarea
                                            value={reason}
                                            onChange={(e) =>
                                                setReason(e.target.value)
                                            }
                                            rows={2}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="bg-blue-800 hover:bg-blue-900 disabled:opacity-60 text-white font-medium rounded-lg px-5 py-2.5"
                                        >
                                            {submitting
                                                ? "Submitting…"
                                                : "Submit request"}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="bg-white rounded-2xl shadow p-6">
                                <h2 className="font-semibold text-lg mb-4">
                                    My Leave Requests
                                </h2>
                                <div className="space-y-4">
                                    {leaves.map((leave) => (
                                        <div
                                            key={leave.id}
                                            className="border border-slate-200 rounded-xl p-4"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-medium">
                                                        {leave.fromDate} → {leave.toDate}
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        {leave.reason}
                                                    </p>
                                                </div>
                                                <StatusBadge
                                                    status={leave.status}
                                                />
                                            </div>

                                            {(leave.facultyRemarks ||
                                                leave.hodRemarks) && (
                                                <div className="mt-2 text-sm text-slate-600 space-y-1">
                                                    {leave.facultyRemarks && (
                                                        <p>
                                                            <span className="font-medium">
                                                                Faculty:
                                                            </span>{" "}
                                                            {leave.facultyRemarks}
                                                        </p>
                                                    )}
                                                    {leave.hodRemarks && (
                                                        <p>
                                                            <span className="font-medium">
                                                                HOD:
                                                            </span>{" "}
                                                            {leave.hodRemarks}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            <LeaveDocuments
                                                leaveRequestId={leave.id}
                                            />
                                        </div>
                                    ))}

                                    {leaves.length === 0 && (
                                        <p className="text-sm text-slate-400">
                                            You have not applied for any leave
                                            yet.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
