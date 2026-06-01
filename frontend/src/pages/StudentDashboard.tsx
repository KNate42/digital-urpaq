import { BookOpen, CalendarDays, FileText, UserRound } from "lucide-react";

import { MetricCard } from "../components/MetricCard";
import { StatusBadge } from "../components/StatusBadge";
import { applications, materials, studentSchedule } from "../data/sampleData";
import { AppShell } from "../layouts/AppShell";

export function StudentDashboard() {
  return (
    <AppShell role="student" title="Student Dashboard">
      <div className="grid gap-6">
        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Applications" value="3" change="1 pending review" icon={<FileText size={20} aria-hidden="true" />} />
          <MetricCard label="Schedule" value="3" change="Next lesson Monday" icon={<CalendarDays size={20} aria-hidden="true" />} />
          <MetricCard label="Materials" value="8" change="2 new assignments" icon={<BookOpen size={20} aria-hidden="true" />} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 text-primary">
                <UserRound size={22} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-ink">Profile</h2>
                <p className="text-sm text-muted">Arman Tulegen · Student</p>
              </div>
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between gap-3 border-b border-line pb-3">
                <dt className="text-muted">Age</dt>
                <dd className="font-semibold">12</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-line pb-3">
                <dt className="text-muted">Contact</dt>
                <dd className="font-semibold">+7 700 111 2211</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Assigned clubs</dt>
                <dd className="font-semibold">Robotics Lab</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">Applications</h2>
            <div className="mt-4 grid gap-3">
              {applications.slice(0, 3).map((application) => (
                <article key={application.id} className="rounded-lg border border-line bg-canvas p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{application.selectedClub}</h3>
                      <p className="text-sm text-muted">{application.submittedAt}</p>
                    </div>
                    <StatusBadge status={application.status} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted">{application.comment}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">Schedule</h2>
            <div className="mt-4 grid gap-3">
              {studentSchedule.map((lesson) => (
                <article key={`${lesson.day}-${lesson.title}`} className="grid grid-cols-[88px_1fr_auto] items-center gap-3 rounded-lg border border-line p-4 text-sm">
                  <div>
                    <p className="font-semibold">{lesson.day}</p>
                    <p className="text-muted">{lesson.time}</p>
                  </div>
                  <div>
                    <p className="font-semibold">{lesson.title}</p>
                    <p className="text-muted">{lesson.classroom}</p>
                  </div>
                  <CalendarDays className="text-primary" size={20} aria-hidden="true" />
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">Materials</h2>
            <div className="mt-4 grid gap-3">
              {materials.map((material) => (
                <article key={material.id} className="rounded-lg border border-line p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{material.title}</h3>
                      <p className="text-sm text-muted">{material.club}</p>
                    </div>
                    <StatusBadge status={material.visibility.toLowerCase() as "public" | "assigned"} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">{material.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
