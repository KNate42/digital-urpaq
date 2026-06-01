import type { ApplicationStatus, EnrollmentStatus } from "../types";

type BadgeStatus = ApplicationStatus | EnrollmentStatus | "public" | "assigned" | "event" | "announcement" | "banner" | "success_story";

const statusClasses: Record<BadgeStatus, string> = {
  new: "bg-blue-50 text-blue-700 ring-blue-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rejected: "bg-rose-50 text-rose-700 ring-rose-200",
  open: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  waitlist: "bg-amber-50 text-amber-700 ring-amber-200",
  closed: "bg-slate-100 text-slate-600 ring-slate-200",
  public: "bg-teal-50 text-teal-700 ring-teal-200",
  assigned: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  event: "bg-sky-50 text-sky-700 ring-sky-200",
  announcement: "bg-slate-100 text-slate-700 ring-slate-200",
  banner: "bg-blue-50 text-blue-700 ring-blue-200",
  success_story: "bg-lime-50 text-lime-700 ring-lime-200"
};

function labelFor(status: BadgeStatus): string {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function StatusBadge({ status }: { status: BadgeStatus }) {
  return (
    <span className={`inline-flex min-w-20 items-center justify-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ${statusClasses[status]}`}>
      {labelFor(status)}
    </span>
  );
}
