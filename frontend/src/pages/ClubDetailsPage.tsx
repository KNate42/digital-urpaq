import { FormEvent, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";

import { api, getToken } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";
import { clubs } from "../data/sampleData";

export function ClubDetailsPage() {
  const { id } = useParams();
  const club = clubs.find((item) => item.id === Number(id)) ?? clubs[0];
  const [form, setForm] = useState({
    studentFullName: "",
    age: "",
    contacts: "",
    comment: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(false);
    setError("");

    if (!getToken()) {
      setError("Please log in or register before submitting an application.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createApplication({
        studentFullName: form.studentFullName,
        age: Number(form.age),
        contacts: form.contacts,
        clubId: club.id,
        comment: form.comment || null
      });
      setSubmitted(true);
      setForm({ studentFullName: "", age: "", contacts: "", comment: "" });
    } catch (applicationError) {
      setError(applicationError instanceof Error ? applicationError.message : "Application submission failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-canvas px-4 py-6 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-lg border border-line bg-white p-6 shadow-sm">
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-primaryDark hover:text-primary" to="/">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to clubs
          </Link>
          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-ink">{club.name}</h1>
              <p className="mt-2 text-base text-muted">{club.category}</p>
            </div>
            <StatusBadge status={club.enrollmentStatus} />
          </div>
          <p className="mt-5 text-base leading-7 text-muted">{club.description}</p>
          <dl className="mt-6 grid gap-3 text-sm">
            {[
              ["Age group", club.ageGroup],
              ["Teacher", club.teacher],
              ["Schedule", club.schedule],
              ["Classroom", club.classroom],
              ["Available seats", String(club.availableSeats)]
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 border-b border-line pb-3 last:border-b-0">
                <dt className="text-muted">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-lg border border-line bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-ink">Submit Application</h2>
          <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-medium text-ink">
                Student full name
                <input
                  className="h-10 rounded-md border border-line px-3 text-sm"
                  value={form.studentFullName}
                  onChange={(event) => setForm((current) => ({ ...current, studentFullName: event.target.value }))}
                  required
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-ink">
                Age
                <input
                  className="h-10 rounded-md border border-line px-3 text-sm"
                  type="number"
                  min={3}
                  max={25}
                  value={form.age}
                  onChange={(event) => setForm((current) => ({ ...current, age: event.target.value }))}
                  required
                />
              </label>
            </div>
            <label className="grid gap-1.5 text-sm font-medium text-ink">
              Contacts
              <input
                className="h-10 rounded-md border border-line px-3 text-sm"
                value={form.contacts}
                onChange={(event) => setForm((current) => ({ ...current, contacts: event.target.value }))}
                required
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-ink">
              Selected club
              <input className="h-10 rounded-md border border-line bg-canvas px-3 text-sm" value={club.name} readOnly />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-ink">
              Comment
              <textarea
                className="min-h-32 rounded-md border border-line px-3 py-2 text-sm"
                value={form.comment}
                onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))}
              />
            </label>
            {submitted ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">Application submitted.</p> : null}
            {error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p> : null}
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            >
              <Send size={18} aria-hidden="true" />
              {isSubmitting ? "Submitting..." : "Submit application"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
