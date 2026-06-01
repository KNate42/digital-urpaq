import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";

import { api } from "../api/client";
import type { UserRole } from "../types";

function routeForRole(role: UserRole): string {
  if (role === "teacher") {
    return "/teacher";
  }
  if (role === "student" || role === "parent") {
    return "/student";
  }
  return "/admin";
}

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const role = await api.login(email, password);
      navigate(routeForRole(role), { replace: true });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-4 py-8">
      <section className="w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-soft">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-bold text-white">DU</div>
          <div>
            <p className="font-semibold text-ink">Digital Urpaq</p>
            <p className="text-sm text-muted">Secure portal access</p>
          </div>
        </Link>

        <h1 className="mt-8 text-2xl font-semibold text-ink">Login</h1>
        <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-1.5 text-sm font-medium text-ink">
            Email
            <input
              className="h-11 rounded-md border border-line px-3 text-sm"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-ink">
            Password
            <input
              className="h-11 rounded-md border border-line px-3 text-sm"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p> : null}
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
          >
            <LogIn size={18} aria-hidden="true" />
            {isLoading ? "Signing in..." : "Login"}
          </button>
        </form>
        <p className="mt-5 text-sm text-muted">
          New student or parent?{" "}
          <Link className="font-semibold text-primaryDark hover:text-primary" to="/register">
            Register
          </Link>
        </p>
      </section>
    </main>
  );
}
