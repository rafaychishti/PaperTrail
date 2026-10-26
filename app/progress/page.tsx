"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAnonId, getLocalAttempts } from "@/lib/client";

type Attempt = { id: string; question_id: string; topic: string; score: number; max_score: number; created_at: string };

const pct = (a: Attempt) => (a.max_score ? Math.round((100 * a.score) / a.max_score) : 0);

export default function ProgressPage() {
  const [attempts, setAttempts] = useState<Attempt[] | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    const anon = getAnonId();
    fetch(`/api/attempts?anon=${encodeURIComponent(anon)}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.storage === "off") {
          setAttempts(getLocalAttempts());
          setNote("Saved in this browser only. Progress moves to the database once Supabase is set up.");
          return;
        }
        setAttempts(j.attempts ?? []);
        if (j.error) setNote(j.error);
      })
      .catch(() => {
        setAttempts(getLocalAttempts());
        setNote("Couldn't load your progress. Check your connection.");
      });
  }, []);

  if (attempts === null) return <p className="py-10 text-muted">Loading your progress…</p>;

  if (attempts.length === 0) {
    return (
      <div className="py-10">
        <h1 className="text-3xl font-bold">Your progress</h1>
        <p className="mt-3 text-muted">{note || "Answer a question and your marks will appear here, topic by topic."}</p>
        <Link href="/" className="mt-6 inline-block rounded-md bg-ink px-5 py-3 font-bold text-paper">Pick a question</Link>
      </div>
    );
  }

  const byTopic = new Map<string, Attempt[]>();
  for (const a of attempts) byTopic.set(a.topic, [...(byTopic.get(a.topic) ?? []), a]);
  const topics = [...byTopic.entries()]
    .map(([topic, list]) => ({
      topic,
      count: list.length,
      first: pct(list[0]),
      latest: pct(list[list.length - 1]),
    }))
    .sort((a, b) => a.latest - b.latest);

  // Score trend across attempts, as a simple line.
  const W = 640, H = 160, pad = 24;
  const pts = attempts.map((a, i) => {
    const x = attempts.length === 1 ? W / 2 : pad + (i * (W - 2 * pad)) / (attempts.length - 1);
    const y = H - pad - (pct(a) / 100) * (H - 2 * pad);
    return [x, y] as const;
  });

  return (
    <div className="py-10">
      <h1 className="text-3xl font-bold">Your progress</h1>
      <p className="mt-2 text-muted">
        {attempts.length} answer{attempts.length > 1 ? "s" : ""} marked. Weakest topics first.
      </p>
      {note && <p className="mt-2 text-sm text-muted">{note}</p>}

      <section className="mt-8" aria-labelledby="trend">
        <h2 id="trend" className="font-bold">Score on each attempt</h2>
        <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full max-w-3xl" role="img" aria-label={`Scores from ${pct(attempts[0])}% to ${pct(attempts[attempts.length - 1])}%`}>
          {[0, 50, 100].map((v) => {
            const y = H - pad - (v / 100) * (H - 2 * pad);
            return (
              <g key={v}>
                <line x1={pad} x2={W - pad} y1={y} y2={y} stroke="var(--rule)" />
                <text x={0} y={y + 4} fontSize="11" fill="var(--muted)">{v}%</text>
              </g>
            );
          })}
          <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke="var(--red)" strokeWidth="2.5" strokeLinejoin="round" />
          {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4" fill="var(--sheet)" stroke="var(--red)" strokeWidth="2" />)}
        </svg>
      </section>

      <section className="mt-8" aria-labelledby="topics">
        <h2 id="topics" className="border-b-2 border-ink pb-2 font-bold">By topic</h2>
        <ul>
          {topics.map((t) => (
            <li key={t.topic} className="grid grid-cols-[9rem_1fr_7rem] items-center gap-4 border-b border-rule py-3 sm:grid-cols-[12rem_1fr_8rem]">
              <span className="font-bold">{t.topic}</span>
              <span className="h-2.5 rounded-full bg-wash" aria-hidden>
                <span className="block h-full rounded-full bg-red" style={{ width: `${Math.max(3, t.latest)}%` }} />
              </span>
              <span className="text-right text-[15px] tabular-nums">
                {t.latest}%{t.count > 1 && <span className="text-muted"> (from {t.first}%)</span>}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
