import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string;
  change: string;
  icon: ReactNode;
  tone?: "teal" | "blue" | "amber" | "emerald" | "rose";
}

const toneClasses: Record<NonNullable<MetricCardProps["tone"]>, string> = {
  teal: "bg-teal-50 text-primary ring-teal-100",
  blue: "bg-blue-50 text-blue-600 ring-blue-100",
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  rose: "bg-rose-50 text-rose-600 ring-rose-100"
};

export function MetricCard({ label, value, change, icon, tone = "teal" }: MetricCardProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-normal text-ink">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ring-1 ${toneClasses[tone]}`}>{icon}</div>
      </div>
      <p className="mt-4 text-sm font-semibold text-primaryDark">{change}</p>
    </section>
  );
}
