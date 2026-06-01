import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";

import { api } from "../api/client";

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    role: "student" as "student" | "parent"
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);
    try {
      await api.register(form);
      setMessage("Registration created. You can log in now.");
      setTimeout(() => navigate("/login"), 700);
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-4 py-8">
      <section className="w-full max-w-xl rounded-lg border border-line bg-white p-6 shadow-soft">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-bold text-white">DU</div>
          <div>
            <p className="font-semibold text-ink">Digital Urpaq</p>
            <p className="text-sm text-muted">Student and parent registration</p>
          </div>
        </Link>

        <h1 className="mt-8 text-2xl font-semibold text-ink">Register</h1>
        <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium text-ink">
              Full name
              <input
                className="h-11 rounded-md border border-line px-3 text-sm"
                value={form.full_name}
                onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))}
                required
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-ink">
              Phone
              <input
                className="h-11 rounded-md border border-line px-3 text-sm"
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              />
            </label>
          </div>
          <label className="grid gap-1.5 text-sm font-medium text-ink">
            Email
            <input
              className="h-11 rounded-md border border-line px-3 text-sm"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              required
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium text-ink">
              Password
              <input
                className="h-11 rounded-md border border-line px-3 text-sm"
                type="password"
                minLength={8}
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                required
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-ink">
              Role
              <select
                className="h-11 rounded-md border border-line px-3 text-sm"
                value={form.role}
                onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as "student" | "parent" }))}
              >
                <option value="student">Student</option>
                <option value="parent">Parent</option>
              </select>
            </label>
          </div>
          {message ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{message}</p> : null}
          {error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p> : null}
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
          >
            <UserPlus size={18} aria-hidden="true" />
            {isLoading ? "Creating account..." : "Register"}
          </button>
        </form>
      </section>
    </main>
  );
}
