import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CalendarDays, FileText, Users } from "lucide-react";

import { AiRecommendationPanel } from "../components/AiRecommendationPanel";
import { StatusBadge } from "../components/StatusBadge";
import { announcements, clubs, materials } from "../data/sampleData";

export function PublicHome() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-base font-bold text-white">DU</div>
            <div>
              <p className="text-base font-semibold">Digital Urpaq</p>
              <p className="text-xs font-medium text-muted">Educational center portal</p>
            </div>
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-muted">
            <a className="rounded-md px-3 py-2 hover:bg-canvas hover:text-ink" href="#clubs">
              Clubs
            </a>
            <a className="rounded-md px-3 py-2 hover:bg-canvas hover:text-ink" href="#materials">
              Materials
            </a>
            <a className="rounded-md px-3 py-2 hover:bg-canvas hover:text-ink" href="#news">
              News
            </a>
            <Link className="rounded-md border border-line px-3 py-2 text-ink hover:bg-canvas" to="/login">
              Login
            </Link>
            <Link className="rounded-md bg-primary px-3 py-2 text-white hover:bg-primaryDark" to="/register">
              Register
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1.25fr_0.75fr] lg:px-8">
        <section className="rounded-lg border border-line bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="max-w-2xl text-3xl font-semibold tracking-normal text-ink sm:text-4xl">
                Manage learning pathways, clubs, applications, and materials in one portal.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
                Guests can browse active clubs, parents can submit applications, teachers can publish learning content, and administrators can manage the center.
              </p>
            </div>
            <Link
              className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primaryDark"
              to="/admin"
            >
              Open dashboard
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Active clubs", value: "24", icon: <CalendarDays size={20} /> },
              { label: "Students", value: "486", icon: <Users size={20} /> },
              { label: "Materials", value: "132", icon: <BookOpen size={20} /> }
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-line bg-canvas p-4">
                <div className="text-primary">{item.icon}</div>
                <p className="mt-3 text-2xl font-semibold">{item.value}</p>
                <p className="text-sm font-medium text-muted">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <AiRecommendationPanel />

        <section id="clubs" className="rounded-lg border border-line bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Clubs</h2>
              <p className="text-sm text-muted">Open groups, schedules, classrooms, and available seats.</p>
            </div>
            <Link className="text-sm font-semibold text-primaryDark hover:text-primary" to="/register">
              Submit application
            </Link>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {clubs.map((club) => (
              <article key={club.id} className="rounded-lg border border-line bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-ink">{club.name}</h3>
                    <p className="text-sm font-medium text-muted">{club.category}</p>
                  </div>
                  <StatusBadge status={club.enrollmentStatus} />
                </div>
                <p className="mt-3 min-h-24 text-sm leading-6 text-muted">{club.description}</p>
                <dl className="mt-4 grid gap-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Age group</dt>
                    <dd className="font-semibold">{club.ageGroup}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Teacher</dt>
                    <dd className="font-semibold">{club.teacher}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Seats</dt>
                    <dd className="font-semibold">{club.availableSeats}</dd>
                  </div>
                </dl>
                <Link
                  className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-md border border-line text-sm font-semibold hover:bg-canvas"
                  to={`/clubs/${club.id}`}
                >
                  Club details
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section id="materials" className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <BookOpen className="text-primary" size={22} aria-hidden="true" />
            <h2 className="text-xl font-semibold">Educational Materials</h2>
          </div>
          <div className="mt-5 grid gap-3">
            {materials.map((material) => (
              <article key={material.id} className="rounded-lg border border-line bg-canvas p-4">
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
        </section>

        <section id="news" className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <FileText className="text-primary" size={22} aria-hidden="true" />
            <h2 className="text-xl font-semibold">Announcements</h2>
          </div>
          <div className="mt-5 grid gap-3">
            {announcements.map((announcement) => (
              <article key={announcement.id} className="rounded-lg border border-line bg-canvas p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="font-semibold">{announcement.title}</h3>
                  <StatusBadge status={announcement.type} />
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">{announcement.body}</p>
                <p className="mt-3 text-xs font-semibold text-muted">{announcement.date}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
