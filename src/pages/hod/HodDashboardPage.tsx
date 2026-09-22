import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import TopBar from "../../components/common/TopBar";
import ErrorBanner from "../../components/common/ErrorBanner";
import StatusBadge from "../../components/common/StatusBadge";
import { getDashboardSummary, processEscalations } from "../../lib/api/dashboard";
import { getAllStudents, createStudent } from "../../lib/api/students";
import { getAllFaculty, createFaculty } from "../../lib/api/faculty";
import { getAllLeaveRequests, hodReview } from "../../lib/api/leaveRequests";
import type {
    DashboardSummary,
    FacultyResponse,
    LeaveRequestResponse,
    StudentDto,
} from "../../lib/api/types";
import { LeaveStatus } from "../../lib/api/types";

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-3xl font-semibold mt-1">{value}</p>
        </div>
    );
}

export default function HodDashboardPage() {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [students, setStudents] = useState<StudentDto[]>([]);
    const [faculty, setFaculty] = useState<FacultyResponse[]>([]);
    const [leaves, setLeaves] = useState<LeaveRequestResponse[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [actioningId, setActioningId] = useState<string | null>(null);
    const [remarksById, setRemarksById] = useState<Record<string, string>>({});
    const [escalating, setEscalating] = useState(false);
    const [escalationMessage, setEscalationMessage] = useState<string | null>(
        null,
    );

    const [studentForm, setStudentForm] = useState({
        usn: "",
        name: "",
        email: "",
        phoneNumber: "",
        department: "",
        semester: 1,
        section: "",
    });
    const [facultyForm, setFacultyForm] = useState({
        employeeCode: "",
        fullName: "",
        email: "",
        department: "",
        designation: "",
    });
    const [creatingStudent, setCreatingStudent] = useState(false);
    const [creatingFaculty, setCreatingFaculty] = useState(false);
    const [createMessage, setCreateMessage] = useState<string | null>(null);

    const loadAll = useCallback(async () => {
        const [summaryData, studentData, facultyData, leaveData] =
            await Promise.all([
                getDashboardSummary(),
                getAllStudents(),
                getAllFaculty(),
                getAllLeaveRequests(),
            ]);

        setSummary(summaryData);
        setStudents(studentData);
        setFaculty(facultyData);
        setLeaves(leaveData);
    }, []);

    useEffect(() => {
        loadAll()
            .catch(() => setError("Could not load your dashboard data."))
            .finally(() => setLoading(false));
    }, [loadAll]);

    async function handleReview(leaveId: string, isApproved: boolean) {
        setActioningId(leaveId);
        setError(null);
        try {
            await hodReview(leaveId, isApproved, remarksById[leaveId] ?? "");
            await loadAll();
        } catch {
            setError("Could not submit review. Please try again.");
        } finally {
            setActioningId(null);
        }
    }

    async function handleEscalate() {
        setEscalating(true);
        setEscalationMessage(null);
        try {
            const result = await processEscalations();
            setEscalationMessage(result.message);
            await loadAll();
        } catch {
            setError("Could not process escalations.");
        } finally {
            setEscalating(false);
        }
    }

    async function handleCreateStudent(event: FormEvent) {
        event.preventDefault();
        setCreatingStudent(true);
        setCreateMessage(null);
        try {
            await createStudent(studentForm);
            setCreateMessage(
                `Student created. Initial login password is their USN (${studentForm.usn}).`,
            );
            setStudentForm({
                usn: "",
                name: "",
                email: "",
                phoneNumber: "",
                department: "",
                semester: 1,
                section: "",
            });
            await loadAll();
        } catch {
            setError("Could not create student.");
        } finally {
            setCreatingStudent(false);
        }
    }

    async function handleCreateFaculty(event: FormEvent) {
        event.preventDefault();
        setCreatingFaculty(true);
        setCreateMessage(null);
        try {
            await createFaculty(facultyForm);
            setCreateMessage(
                `Faculty created. Initial login password is their employee code (${facultyForm.employeeCode}).`,
            );
            setFacultyForm({
                employeeCode: "",
                fullName: "",
                email: "",
                department: "",
                designation: "",
            });
            await loadAll();
        } catch {
            setError("Could not create faculty.");
        } finally {
            setCreatingFaculty(false);
        }
    }

    const studentsById = new Map(students.map((s) => [s.id, s]));
    const pending = leaves.filter(
        (l) =>
            l.status === LeaveStatus.ApprovedByFaculty ||
            l.status === LeaveStatus.EscalatedToHod,
    );

    return (
        <div className="min-h-screen bg-slate-100">
            <TopBar />

            <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
                <ErrorBanner message={error} />

                {loading ? (
                    <p className="text-slate-500">Loading…</p>
                ) : (
                    <>
                        {summary && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <StatCard
                                    label="Students"
                                    value={summary.totalStudents}
                                />
                                <StatCard
                                    label="Faculty"
                                    value={summary.totalFaculty}
                                />
                                <StatCard
                                    label="Pending Faculty Review"
                                    value={summary.pendingFacultyLeaves}
                                />
                                <StatCard
                                    label="Approved Leaves"
                                    value={summary.approvedLeaves}
                                />
                                <StatCard
                                    label="Rejected Leaves"
                                    value={summary.rejectedLeaves}
                                />
                                <StatCard
                                    label="Documents Uploaded"
                                    value={summary.documentsUploaded}
                                />
                                <StatCard
                                    label="Verified Documents"
                                    value={summary.verifiedDocuments}
                                />
                                <StatCard
                                    label="Notifications"
                                    value={summary.notifications}
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl shadow p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-semibold text-lg">
                                        Pending HOD Review ({pending.length})
                                    </h2>
                                    <button
                                        onClick={handleEscalate}
                                        disabled={escalating}
                                        className="text-sm px-3 py-1.5 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-800 disabled:opacity-60"
                                    >
                                        {escalating
                                            ? "Processing…"
                                            : "Run escalation check"}
                                    </button>
                                </div>

                                {escalationMessage && (
                                    <p className="text-sm text-green-700 mb-3">
                                        {escalationMessage}
                                    </p>
                                )}

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
                                            Nothing waiting on HOD review.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl shadow p-6">
                                    <h2 className="font-semibold text-lg mb-4">
                                        Faculty Roster ({faculty.length})
                                    </h2>
                                    <ul className="space-y-2 max-h-48 overflow-y-auto">
                                        {faculty.map((f) => (
                                            <li
                                                key={f.id}
                                                className="text-sm flex justify-between border-b border-slate-100 pb-2 last:border-0"
                                            >
                                                <span>{f.fullName}</span>
                                                <span className="text-slate-500">
                                                    {f.designation}
                                                </span>
                                            </li>
                                        ))}
                                        {faculty.length === 0 && (
                                            <li className="text-sm text-slate-400">
                                                No faculty yet.
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                <div className="bg-white rounded-2xl shadow p-6">
                                    <h2 className="font-semibold text-lg mb-4">
                                        Add Student
                                    </h2>
                                    <form
                                        onSubmit={handleCreateStudent}
                                        className="grid grid-cols-2 gap-3"
                                    >
                                        <input
                                            required
                                            placeholder="USN"
                                            value={studentForm.usn}
                                            onChange={(e) =>
                                                setStudentForm((f) => ({
                                                    ...f,
                                                    usn: e.target.value,
                                                }))
                                            }
                                            className="col-span-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                        />
                                        <input
                                            required
                                            placeholder="Full name"
                                            value={studentForm.name}
                                            onChange={(e) =>
                                                setStudentForm((f) => ({
                                                    ...f,
                                                    name: e.target.value,
                                                }))
                                            }
                                            className="col-span-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                        />
                                        <input
                                            required
                                            type="email"
                                            placeholder="Email"
                                            value={studentForm.email}
                                            onChange={(e) =>
                                                setStudentForm((f) => ({
                                                    ...f,
                                                    email: e.target.value,
                                                }))
                                            }
                                            className="col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                        />
                                        <input
                                            placeholder="Phone"
                                            value={studentForm.phoneNumber}
                                            onChange={(e) =>
                                                setStudentForm((f) => ({
                                                    ...f,
                                                    phoneNumber:
                                                        e.target.value,
                                                }))
                                            }
                                            className="col-span-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                        />
                                        <input
                                            placeholder="Department"
                                            value={studentForm.department}
                                            onChange={(e) =>
                                                setStudentForm((f) => ({
                                                    ...f,
                                                    department:
                                                        e.target.value,
                                                }))
                                            }
                                            className="col-span-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                        />
                                        <input
                                            type="number"
                                            min={1}
                                            placeholder="Semester"
                                            value={studentForm.semester}
                                            onChange={(e) =>
                                                setStudentForm((f) => ({
                                                    ...f,
                                                    semester: Number(
                                                        e.target.value,
                                                    ),
                                                }))
                                            }
                                            className="col-span-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                        />
                                        <input
                                            placeholder="Section"
                                            value={studentForm.section}
                                            onChange={(e) =>
                                                setStudentForm((f) => ({
                                                    ...f,
                                                    section: e.target.value,
                                                }))
                                            }
                                            className="col-span-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                        />
                                        <button
                                            type="submit"
                                            disabled={creatingStudent}
                                            className="col-span-2 bg-blue-800 hover:bg-blue-900 disabled:opacity-60 text-white font-medium rounded-lg py-2 text-sm"
                                        >
                                            {creatingStudent
                                                ? "Adding…"
                                                : "Add student"}
                                        </button>
                                    </form>
                                </div>

                                <div className="bg-white rounded-2xl shadow p-6">
                                    <h2 className="font-semibold text-lg mb-4">
                                        Add Faculty
                                    </h2>
                                    <form
                                        onSubmit={handleCreateFaculty}
                                        className="grid grid-cols-2 gap-3"
                                    >
                                        <input
                                            required
                                            placeholder="Employee code"
                                            value={facultyForm.employeeCode}
                                            onChange={(e) =>
                                                setFacultyForm((f) => ({
                                                    ...f,
                                                    employeeCode:
                                                        e.target.value,
                                                }))
                                            }
                                            className="col-span-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                        />
                                        <input
                                            required
                                            placeholder="Full name"
                                            value={facultyForm.fullName}
                                            onChange={(e) =>
                                                setFacultyForm((f) => ({
                                                    ...f,
                                                    fullName: e.target.value,
                                                }))
                                            }
                                            className="col-span-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                        />
                                        <input
                                            required
                                            type="email"
                                            placeholder="Email"
                                            value={facultyForm.email}
                                            onChange={(e) =>
                                                setFacultyForm((f) => ({
                                                    ...f,
                                                    email: e.target.value,
                                                }))
                                            }
                                            className="col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                        />
                                        <input
                                            placeholder="Department"
                                            value={facultyForm.department}
                                            onChange={(e) =>
                                                setFacultyForm((f) => ({
                                                    ...f,
                                                    department:
                                                        e.target.value,
                                                }))
                                            }
                                            className="col-span-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                        />
                                        <input
                                            placeholder="Designation (e.g. HOD)"
                                            value={facultyForm.designation}
                                            onChange={(e) =>
                                                setFacultyForm((f) => ({
                                                    ...f,
                                                    designation:
                                                        e.target.value,
                                                }))
                                            }
                                            className="col-span-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                        />
                                        <button
                                            type="submit"
                                            disabled={creatingFaculty}
                                            className="col-span-2 bg-blue-800 hover:bg-blue-900 disabled:opacity-60 text-white font-medium rounded-lg py-2 text-sm"
                                        >
                                            {creatingFaculty
                                                ? "Adding…"
                                                : "Add faculty"}
                                        </button>
                                    </form>
                                </div>

                                {createMessage && (
                                    <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                                        {createMessage}
                                    </p>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
