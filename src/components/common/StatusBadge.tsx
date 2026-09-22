import { LeaveStatusLabels } from "../../lib/api/types";
import type { LeaveStatusValue } from "../../lib/api/types";

const STATUS_STYLES: Record<LeaveStatusValue, string> = {
    1: "bg-amber-100 text-amber-800",
    2: "bg-blue-100 text-blue-800",
    3: "bg-red-100 text-red-800",
    4: "bg-orange-100 text-orange-800",
    5: "bg-green-100 text-green-800",
    6: "bg-red-100 text-red-800",
};

export default function StatusBadge({
    status,
}: {
    status: LeaveStatusValue;
}) {
    return (
        <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[status]}`}
        >
            {LeaveStatusLabels[status]}
        </span>
    );
}
