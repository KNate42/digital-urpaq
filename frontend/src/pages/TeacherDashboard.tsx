import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import { BookUp, Megaphone, Send, Users } from "lucide-react";

import { api, isApiUnavailableError } from "../api/client";
import { EmptyState } from "../components/EmptyState";
import { MetricCard } from "../components/MetricCard";
import { StatusBadge } from "../components/StatusBadge";
import { AppShell } from "../layouts/AppShell";
import type { Announcement, Application, Club, ContentType, Material } from "../types";

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

const materialTypes: ContentType[] = ["article", "video", "presentation", "attachment", "homework"];

function prettyLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function TeacherDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [materialTitle, setMaterialTitle] = useState("");
  const [materialDescription, setMaterialDescription] = useState("");
  const [materialType, setMaterialType] = useState<ContentType>("attachment");
  const [materialClubId, setMaterialClubId] = useState("");
  const [materialIsPublic, setMaterialIsPublic] = useState(false);

  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementBody, setAnnouncementBody] = useState("");

  async function loadDashboard() {
    setIsLoading(true);
    const [applicationsResult, materialsResult, announcementsResult, clubsResult] = await Promise.allSettled([
      api.listApplications(),
      api.listMaterials(),
      api.listAnnouncements(),
      api.listClubs()
    ]);

    setApplications(applicationsResult.status === "fulfilled" ? applicationsResult.value : []);
    setMaterials(materialsResult.status === "fulfilled" ? materialsResult.value : []);
    setAnnouncements(announcementsResult.status === "fulfilled" ? announcementsResult.value : []);
    setClubs(clubsResult.status === "fulfilled" ? clubsResult.value : []);

    const failures = [applicationsResult, materialsResult, announcementsResult, clubsResult].filter(
      (result): result is PromiseRejectedResult => result.status === "rejected"
    );
    const apiUnavailable = failures.some((result) => isApiUnavailableError(result.reason));
    setNotice(
      failures.length === 0
        ? ""
        : apiUnavailable
          ? "Backend API is unavailable. No local records are shown."
          : "Sign in as a teacher to load assigned students and materials."
    );
    setIsLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const approvedStudents = useMemo(
    () => new Set(applications.filter((application) => application.status === "approved").map((application) => application.studentFullName)),
    [applications]
  );

  async function handleMaterialSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    try {
      const createdMaterial = await api.createMaterial({
        title: materialTitle.trim(),
        description: materialDescription.trim() || null,
        type: materialType,
        clubId: materialClubId ? Number(materialClubId) : null,
        isPublic: materialIsPublic
      });
      setMaterials((current) => [createdMaterial, ...current]);
      setMaterialTitle("");
      setMaterialDescription("");
      setMaterialClubId("");
      setMaterialIsPublic(false);
      setNotice("Material saved.");
    } catch (error) {
      setNotice(isApiUnavailableError(error) ? "Backend API is unavailable. Material was not saved." : error instanceof Error ? error.message : "Material was not saved.");
    }
  }

  async function handleAnnouncementSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    try {
      const createdAnnouncement = await api.createAnnouncement({
        title: announcementTitle.trim(),
        body: announcementBody.trim(),
        type: "announcement",
        published: true
      });
      setAnnouncements((current) => [createdAnnouncement, ...current]);
      setAnnouncementTitle("");
      setAnnouncementBody("");
      setNotice("Announcement published.");
    } catch (error) {
      setNotice(isApiUnavailableError(error) ? "Backend API is unavailable. Announcement was not saved." : error instanceof Error ? error.message : "Announcement was not saved.");
    }
  }

  return (
    <AppShell role="teacher" title="Teacher Dashboard">
      <div className="grid gap-6">
        {notice ? <p className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">{notice}</p> : null}

        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Assigned students" value={isLoading ? "-" : String(approvedStudents.size)} change="Approved applications" icon={<Users size={20} aria-hidden="true" />} />
          <MetricCard label="Materials" value={isLoading ? "-" : String(materials.length)} change="Backend content records" icon={<BookUp size={20} aria-hidden="true" />} />
          <MetricCard label="Announcements" value={isLoading ? "-" : String(announcements.length)} change="Published records" icon={<Megaphone size={20} aria-hidden="true" />} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Panel title="Assigned Students">
            {applications.length ? (
              <div className="overflow-x-auto rounded-lg border border-line">
                <table className="min-w-[640px] table-fixed text-left text-sm">
                  <thead className="bg-canvas text-xs font-semibold uppercase tracking-normal text-muted">
                    <tr>
                      <th className="w-[40%] px-4 py-3">Student</th>
                      <th className="w-[34%] px-4 py-3">Club</th>
                      <th className="w-[26%] px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {applications.map((application) => (
                      <tr key={application.id}>
                        <td className="px-4 py-3">
                          <p className="font-semibold">{application.studentFullName}</p>
                          <p className="text-muted">Age {application.age}</p>
                        </td>
                        <td className="px-4 py-3 font-medium text-muted">{application.selectedClub}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={application.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No assigned students yet" description="Approved applications for clubs assigned to this teacher will appear here." />
            )}
          </Panel>

          <form className="rounded-lg border border-line bg-white p-5 shadow-sm" onSubmit={handleMaterialSubmit}>
            <h2 className="text-lg font-semibold text-ink">Upload Educational Material</h2>
            <label className="mt-4 grid gap-1.5 text-sm font-medium text-ink">
              Title
              <input className="h-10 rounded-md border border-line px-3 text-sm" value={materialTitle} onChange={(event) => setMaterialTitle(event.target.value)} required />
            </label>
            <label className="mt-3 grid gap-1.5 text-sm font-medium text-ink">
              Description
              <textarea className="min-h-24 rounded-md border border-line px-3 py-2 text-sm" value={materialDescription} onChange={(event) => setMaterialDescription(event.target.value)} />
            </label>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-medium text-ink">
                Club
                <select className="h-10 rounded-md border border-line px-3 text-sm" value={materialClubId} onChange={(event) => setMaterialClubId(event.target.value)}>
                  <option value="">All clubs</option>
                  {clubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-ink">
                Type
                <select className="h-10 rounded-md border border-line px-3 text-sm" value={materialType} onChange={(event) => setMaterialType(event.target.value as ContentType)}>
                  {materialTypes.map((type) => (
                    <option key={type} value={type}>
                      {prettyLabel(type)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm font-medium text-ink">
              <input className="h-4 w-4 accent-primary" type="checkbox" checked={materialIsPublic} onChange={(event) => setMaterialIsPublic(event.target.checked)} />
              Public material
            </label>
            <button className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primaryDark">
              <BookUp size={18} aria-hidden="true" />
              Upload material
            </button>
          </form>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
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
              <EmptyState title="No materials yet" description="Materials created by this teacher or assigned clubs will appear here." />
            )}
          </Panel>

          <form className="rounded-lg border border-line bg-white p-5 shadow-sm" onSubmit={handleAnnouncementSubmit}>
            <h2 className="text-lg font-semibold text-ink">Publish Announcement</h2>
            <label className="mt-4 grid gap-1.5 text-sm font-medium text-ink">
              Title
              <input className="h-10 rounded-md border border-line px-3 text-sm" value={announcementTitle} onChange={(event) => setAnnouncementTitle(event.target.value)} required />
            </label>
            <label className="mt-3 grid gap-1.5 text-sm font-medium text-ink">
              Message
              <textarea className="min-h-36 rounded-md border border-line px-3 py-2 text-sm" value={announcementBody} onChange={(event) => setAnnouncementBody(event.target.value)} required />
            </label>
            <button className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primaryDark">
              <Send size={18} aria-hidden="true" />
              Publish
            </button>
          </form>
        </section>
      </div>
    </AppShell>
  );
}
