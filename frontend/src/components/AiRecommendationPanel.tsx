import { useState } from "react";
import { Sparkles } from "lucide-react";

import { api } from "../api/client";
import type { Recommendation } from "../types";

function parseList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function AiRecommendationPanel({ className = "" }: { className?: string }) {
  const [age, setAge] = useState("");
  const [interests, setInterests] = useState("");
  const [skills, setSkills] = useState("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState("Create clubs first to generate recommendations.");

  async function handleRecommend() {
    const parsedAge = Number(age);
    if (!Number.isFinite(parsedAge) || parsedAge < 3) {
      setRecommendations([]);
      setNotice("Enter a valid student age first.");
      return;
    }

    setIsLoading(true);
    setNotice("");
    const payload = {
      age: parsedAge,
      interests: parseList(interests),
      skills: parseList(skills)
    };

    try {
      const result = await api.recommend(payload);
      setRecommendations(result);
      setNotice(result.length ? "" : "No matching active clubs found yet.");
    } catch (error) {
      setRecommendations([]);
      setNotice(error instanceof Error ? error.message : "Recommendations are unavailable right now.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className={`rounded-lg border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-primary ring-1 ring-teal-100">
          <Sparkles size={20} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-ink">AI Recommendation Assistant</h2>
          <p className="text-sm font-medium text-muted">Match a student profile to active clubs.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        <label className="grid gap-1.5 text-sm font-semibold text-ink">
          Student age
          <input
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-ink outline-none transition focus:border-primary focus:ring-4 focus:ring-teal-100"
            type="number"
            min={3}
            max={25}
            value={age}
            onChange={(event) => setAge(event.target.value)}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-ink">
          Interests
          <input
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-ink outline-none transition focus:border-primary focus:ring-4 focus:ring-teal-100"
            placeholder="comma-separated interests"
            value={interests}
            onChange={(event) => setInterests(event.target.value)}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-ink">
          Skills
          <input
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-ink outline-none transition focus:border-primary focus:ring-4 focus:ring-teal-100"
            placeholder="comma-separated skills"
            value={skills}
            onChange={(event) => setSkills(event.target.value)}
          />
        </label>
        <button
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-bold text-white shadow-[0_12px_24px_rgba(15,159,143,0.22)] transition hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          onClick={handleRecommend}
          disabled={isLoading}
        >
          {isLoading ? "Recommending..." : "Recommend clubs"}
        </button>
      </div>

      {notice ? <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 ring-1 ring-amber-100">{notice}</p> : null}

      <div className="mt-5 grid gap-3">
        {recommendations.map((recommendation) => (
          <article key={recommendation.clubId} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-ink">{recommendation.clubName}</h3>
                <p className="text-xs font-medium text-muted">{recommendation.category}</p>
              </div>
              <span className="rounded-md bg-white px-2.5 py-1 text-xs font-bold text-primary ring-1 ring-teal-100">
                {recommendation.score}% match
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">{recommendation.explanation}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
