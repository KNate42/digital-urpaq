import { FormEvent, useState } from "react";
import { BookUp, Megaphone, Send, Users } from "lucide-react";

import { MetricCard } from "../components/MetricCard";
import { StatusBadge } from "../components/StatusBadge";
import { applications, materials as initialMaterials } from "../data/sampleData";
import { AppShell } from "../layouts/AppShell";
import type { Material } from "../types";

export function TeacherDashboard() {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [materialTitle, setMaterialTitle] = useState("");
  const [announcement, setAnnouncement] = useState("");

  function handleMaterialSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!materialTitle.trim()) {
      return;
    }
    setMaterials((current) => [
      {
        id: Date.now(),
        title: materialTitle,
        description: "Teacher-uploaded material awaiting attachment processing.",
        type: "attachment",
        club: "Robotics Lab",
        visibility: "Assigned",
        updatedAt: new Date().toISOString().slice(0, 10)
      },
      ...current
    ]);
    setMaterialTitle("");
  }

  function handleAnnouncementSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAnnouncement("");
  }

  return (
    <AppShell role="teacher" title="Teacher Dashboard">
      <div className="grid gap-6">
        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Assigned students" value="42" change="6 new this month" icon={<Users size={20} aria-hidden="true" />} />
          <MetricCard label="Materials" value={String(materials.length)} change="Updated today" icon={<BookUp size={20} aria-hidden="true" />} />
          <MetricCard label="Announcements" value="5" change="2 scheduled events" icon={<Megaphone size={20} aria-hidden="true" />} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">Assigned Students</h2>
            <div className="mt-4 overflow-hidden rounded-lg border border-line">
              <div className="grid grid-cols-[1fr_140px_140px] gap-3 bg-canvas px-4 py-3 text-xs font-semibold uppercase tracking-normal text-muted">
                <span>Student</span>
                <span>Club</span>
                <span>Status</span>
              </div>
              {applications.slice(0, 3).map((application) => (
                <div key={application.id} className="grid grid-cols-[1fr_140px_140px] items-center gap-3 border-b border-line px-4 py-3 text-sm last:border-b-0">
                  <div>
                    <p className="font-semibold">{application.studentFullName}</p>
                    <p className="text-muted">Age {application.age}</p>
                  </div>
                  <span className="font-medium text-muted">{application.selectedClub}</span>
                  <StatusBadge status={application.status} />
                </div>
              ))}
            </div>
          </div>

          <form className="rounded-lg border border-line bg-white p-5 shadow-sm" onSubmit={handleMaterialSubmit}>
            <h2 className="text-lg font-semibold text-ink">Upload Educational Material</h2>
            <label className="mt-4 grid gap-1.5 text-sm font-medium text-ink">
              Title
              <input
                className="h-10 rounded-md border border-line px-3 text-sm"
                value={materialTitle}
                onChange={(event) => setMaterialTitle(event.target.value)}
                placeholder="Lesson slides or homework"
              />
            </label>
            <label className="mt-3 grid gap-1.5 text-sm font-medium text-ink">
              Club
              <select className="h-10 rounded-md border border-line px-3 text-sm">
                <option>Robotics Lab</option>
                <option>Python Foundations</option>
              </select>
            </label>
            <button className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primaryDark">
              <BookUp size={18} aria-hidden="true" />
              Upload material
            </button>
          </form>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">Materials</h2>
            <div className="mt-4 grid gap-3">
              {materials.slice(0, 5).map((material) => (
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

          <form className="rounded-lg border border-line bg-white p-5 shadow-sm" onSubmit={handleAnnouncementSubmit}>
            <h2 className="text-lg font-semibold text-ink">Publish Announcement</h2>
            <label className="mt-4 grid gap-1.5 text-sm font-medium text-ink">
              Announcement
              <textarea
                className="min-h-36 rounded-md border border-line px-3 py-2 text-sm"
                value={announcement}
                onChange={(event) => setAnnouncement(event.target.value)}
                placeholder="Lesson update, event reminder, or success story"
              />
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
