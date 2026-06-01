import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BookOpen, CalendarDays, FileText, UserRound } from "lucide-react";

import { api, isApiUnavailableError } from "../api/client";
import { EmptyState } from "../components/EmptyState";
import { MetricCard } from "../components/MetricCard";
import { StatusBadge } from "../components/StatusBadge";
import { AppShell } from "../layouts/AppShell";
import type { Application, Club, ManagedUser, Material } from "../types";

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function StudentDashboard() {
  const [profile, setProfile] = useState<ManagedUser | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setIsLoading(true);
      const [profileResult, applicationsResult, materialsResult, clubsResult] = await Promise.allSettled([
        api.currentUser(),
        api.listApplications(),
        api.listMaterials(),
        api.listClubs()
      ]);

      if (cancelled) {
        return;
      }

      setProfile(profileResult.status === "fulfilled" ? profileResult.value : null);
      setApplications(applicationsResult.status === "fulfilled" ? applicationsResult.value : []);
      setMaterials(materialsResult.status === "fulfilled" ? materialsResult.value : []);
      setClubs(clubsResult.status === "fulfilled" ? clubsResult.value : []);

      const failures = [profileResult, applicationsResult, materialsResult, clubsResult].filter(
        (result): result is PromiseRejectedResult => result.status === "rejected"
      );
      const apiUnavailable = failures.some((result) => isApiUnavailableError(result.reason));
      setNotice(
        failures.length === 0
          ? ""
          : apiUnavailable
            ? "Backend API is unavailable. No local records are shown."
            : "Sign in as a student or parent to load your dashboard data."
      );
      setIsLoading(false);
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const approvedClubNames = useMemo(
    () => new Set(applications.filter((application) => application.status === "approved").map((application) => application.selectedClub)),
    [applications]
  );

  const scheduleClubs = useMemo(() => clubs.filter((club) => approvedClubNames.has(club.name)), [clubs, approvedClubNames]);
  const pendingCount = applications.filter((application) => application.status === "pending" || application.status === "new").length;

  return (
    <AppShell role="student" title="Student Dashboard">
      <div className="grid gap-6">
        {notice ? <p className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">{notice}</p> : null}

        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Applications" value={isLoading ? "-" : String(applications.length)} change={`${pendingCount} awaiting decision`} icon={<FileText size={20} aria-hidden="true" />} />
          <MetricCard label="Schedule" value={isLoading ? "-" : String(scheduleClubs.length)} change="Approved club schedules" icon={<CalendarDays size={20} aria-hidden="true" />} />
          <MetricCard label="Materials" value={isLoading ? "-" : String(materials.length)} change="Assigned content records" icon={<BookOpen size={20} aria-hidden="true" />} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <Panel title="Profile">
            {profile ? (
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 text-primary">
                    <UserRound size={22} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-ink">{profile.fullName}</p>
                    <p className="text-sm text-muted">{profile.role}</p>
                  </div>
                </div>
                <dl className="mt-5 grid gap-3 text-sm">
                  <div className="flex justify-between gap-3 border-b border-line pb-3">
                    <dt className="text-muted">Email</dt>
                    <dd className="text-right font-semibold">{profile.email}</dd>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-line pb-3">
                    <dt className="text-muted">Phone</dt>
                    <dd className="text-right font-semibold">{profile.phone}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Joined</dt>
                    <dd className="font-semibold">{profile.joinedAt}</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <EmptyState title="No profile loaded" description="Sign in to view profile details." />
            )}
          </Panel>

          <Panel title="Applications">
            {applications.length ? (
              <div className="grid gap-3">
                {applications.map((application) => (
                  <article key={application.id} className="rounded-lg border border-line bg-canvas p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{application.selectedClub}</h3>
                        <p className="text-sm text-muted">{application.submittedAt}</p>
                      </div>
                      <StatusBadge status={application.status} />
                    </div>
                    {application.comment ? <p className="mt-3 text-sm leading-6 text-muted">{application.comment}</p> : null}
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState title="No applications yet" description="Submitted applications will appear here with their current status." />
            )}
          </Panel>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <Panel title="Schedule">
            {scheduleClubs.length ? (
              <div className="grid gap-3">
                {scheduleClubs.map((club) => (
                  <article key={club.id} className="grid gap-3 rounded-lg border border-line p-4 text-sm md:grid-cols-[1fr_140px_120px] md:items-center">
                    <div>
                      <p className="font-semibold">{club.name}</p>
                      <p className="text-muted">{club.schedule}</p>
                    </div>
                    <span className="font-medium text-muted">{club.classroom}</span>
                    <StatusBadge status={club.enrollmentStatus} />
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState title="No schedule yet" description="Approved applications with club schedules will appear here." />
            )}
          </Panel>

          <Panel title="Materials">
            {materials.length ? (
              <div className="grid gap-3">
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
            ) : (
              <EmptyState title="No assigned materials yet" description="Materials assigned to approved clubs will appear here." />
            )}
          </Panel>
        </section>
      </div>
    </AppShell>
  );
}
