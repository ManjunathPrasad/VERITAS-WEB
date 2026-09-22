import { useCallback, useEffect, useState } from "react";
import TopBar from "../../components/common/TopBar";
import ErrorBanner from "../../components/common/ErrorBanner";
import StatusBadge from "../../components/common/StatusBadge";
import { useAuth } from "../../app/auth/useAuth";
import { getFacultyById } from "../../lib/api/faculty";
import { getAllStudents } from "../../lib/api/students";
import {
    facultyReview,
    getAllLeaveRequests,
} from "../../lib/api/leaveRequests";
import type {
    FacultyResponse,
    LeaveRequestResponse,
    StudentDto,
} from "../../lib/api/types";
import { LeaveStatus } from "../../lib/api/types";

export default function FacultyDashboardPage() {
    const { user } = useAuth();
    const facultyId = user?.facultyId ?? "";

    const [faculty, setFaculty] = useState<FacultyResponse | null>(null);
    const [students, setStudents] = useState<StudentDto[]>([]);
    const [leaves, setLeaves] = useState<LeaveRequestResponse[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [actioningId, setActioningId] = useState<string | null>(null);
    const [remarksById, setRemarksById] = useState<Record<string, string>>({});

    const loadAll = useCallback(async () => {
        if (!facultyId) return;

        const [facultyData, studentData, leaveData] = await Promise.all([
            getFacultyById(facultyId),
            getAllStudents(),
            getAllLeaveRequests(),
        ]);

        setFaculty(facultyData);
        setStudents(studentData);
        setLeaves(leaveData.filter((l) => l.facultyId === facultyId));
    }, [facultyId]);

    useEffect(() => {
        loadAll()
            .catch(() => setError("Could not load your dashboard data."))
            .finally(() => setLoading(false));
    }, [loadAll]);

    async function handleReview(leaveId: string, isApproved: boolean) {
        setActioningId(leaveId);
        setError(null);
        try {
            await facultyReview(
                leaveId,
                isApproved,
                remarksById[leaveId] ?? "",
            );
            await loadAll();
        } catch {
            setError("Could not submit review. Please try again.");
        } finally {
            setActioningId(null);
        }
    }

    const studentsById = new Map(students.map((s) => [s.id, s]));
    const pending = leaves.filter(
        (l) => l.status === LeaveStatus.PendingFaculty,
    );
    const reviewed = leaves.filter(
        (l) => l.status !== LeaveStatus.PendingFaculty,
    );

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
                                {faculty && (
                                    <dl className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <dt className="text-slate-500">
                                                Employee code
                                            </dt>
                                            <dd className="font-medium">
                                                {faculty.employeeCode}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-slate-500">
                                                Department
                                            </dt>
                                            <dd className="font-medium">
                                                {faculty.department}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-slate-500">
                                                Designation
                                            </dt>
                                            <dd className="font-medium">
                                                {faculty.designation}
                                            </dd>
                                        </div>
                                    </dl>
                                )}
                            </div>

                            <div className="bg-white rounded-2xl shadow p-6">
                                <h2 className="font-semibold text-lg mb-4">
                                    Students ({students.length})
                                </h2>
                                <ul className="space-y-2 max-h-96 overflow-y-auto">
                                    {students.map((s) => (
                                        <li
                                            key={s.id}
                                            className="text-sm flex justify-between border-b border-slate-100 pb-2 last:border-0"
                                        >
                                            <span>
                                                {s.name}{" "}
                                                <span className="text-slate-400">
                                                    ({s.usn})
                                                </span>
                                            </span>
                                            <span className="text-slate-500">
                                                {s.attendancePercentage}%
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl shadow p-6">
                                <h2 className="font-semibold text-lg mb-4">
                                    Pending Leave Requests ({pending.length})
                                </h2>
                                <div className="space-y-4">
                                    {pending.map((leave) => (
                                        <div
                                            key={leave.id}
                                            className="border border-slate-200 rounded-xl p-4"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-medium">
                                                        {studentsById.get(
                                                            leave.studentId,
                                                        )?.name ?? "Student"}{" "}
                                                        · {leave.fromDate} →{" "}
                                                        {leave.toDate}
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        {leave.reason}
                                                    </p>
                                                </div>
                                                <StatusBadge
                                                    status={leave.status}
                                                />
                                            </div>

                                            <textarea
                                                placeholder="Remarks (optional)"
                                                value={
                                                    remarksById[leave.id] ?? ""
                                                }
                                                onChange={(e) =>
                                                    setRemarksById((prev) => ({
                                                        ...prev,
                                                        [leave.id]:
                                                            e.target.value,
                                                    }))
                                                }
                                                rows={2}
                                                className="w-full mt-3 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                            />

                                            <div className="mt-3 flex gap-2">
                                                <button
                                                    disabled={
                                                        actioningId ===
                                                        leave.id
                                                    }
                                                    onClick={() =>
                                                        handleReview(
                                                            leave.id,
                                                            true,
                                                        )
                                                    }
                                                    className="px-4 py-2 rounded-lg bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white text-sm font-medium"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    disabled={
                                                        actioningId ===
                                                        leave.id
                                                    }
                                                    onClick={() =>
                                                        handleReview(
                                                            leave.id,
                                                            false,
                                                        )
                                                    }
                                                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-medium"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {pending.length === 0 && (
                                        <p className="text-sm text-slate-400">
                                            No pending leave requests.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow p-6">
                                <h2 className="font-semibold text-lg mb-4">
                                    Review History
                                </h2>
                                <div className="space-y-3">
                                    {reviewed.map((leave) => (
                                        <div
                                            key={leave.id}
                                            className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0"
                                        >
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {studentsById.get(
                                                        leave.studentId,
                                                    )?.name ?? "Student"}{" "}
                                                    · {leave.fromDate} →{" "}
                                                    {leave.toDate}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {leave.reason}
                                                </p>
                                            </div>
                                            <StatusBadge status={leave.status} />
                                        </div>
                                    ))}

                                    {reviewed.length === 0 && (
                                        <p className="text-sm text-slate-400">
                                            No reviewed requests yet.
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
