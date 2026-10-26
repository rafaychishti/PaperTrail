"use client";

import { useState } from "react";
import Link from "next/link";
import type { MarkResult, PointResult } from "@/lib/types";
import { getAnonId } from "@/lib/client";

const TYPE_NAME = { M: "Method", A: "Accuracy", B: "Independent" } as const;

function markLabel(p: PointResult) {
  const code = `${p.type}${p.awarded}`;
  return p.awarded > 0 ? `${code} ✓` : `${code} ✗`;
}

export default function MarkedScript({
  result,
  answer,
  photos,
  attemptId,
  onRetry,
}: {
  result: MarkResult;
  answer: string;
  photos: string[];
  attemptId: string | null;
  onRetry: () => void;
}) {
  const [flagged, setFlagged] = useState<Record<string, "sending" | "sent" | "error">>({});
  const lost = result.points.filter((p) => p.awarded < p.maxMarks);

  async function challenge(pointId: string) {
    if (!attemptId) return;
    setFlagged((f) => ({ ...f, [pointId]: "sending" }));
    const res = await fetch("/api/flag", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ attemptId, anonId: getAnonId(), pointId }),
    }).catch(() => null);
    setFlagged((f) => ({ ...f, [pointId]: res?.ok ? "sent" : "error" }));
  }

  return (
    <div className="space-y-8">
      {/* Total, circled the way an examiner does it */}
      <div className="flex flex-wrap items-center gap-6">
        <span className="hand circled ink-in grid h-20 w-24 place-items-center text-4xl text-red" aria-label={`Score ${result.score} out of ${result.maxScore}`}>
          {result.score}/{result.maxScore}
        </span>
        <div className="max-w-[40rem]">
          <p>{result.summary}</p>
          {result.confidence !== "high" && (
            <p className="mt-2 text-sm text-muted">
              The marker is {result.confidence === "low" ? "not confident" : "fairly confident"} about this result
              {result.readingIssues ? `: ${result.readingIssues}` : "."} Ask your teacher to check it.
            </p>
          )}
        </div>
      </div>

      {/* The marked script: evidence on the lines, marks in the red margin */}
      <section aria-labelledby="script">
        <h2 id="script" className="mb-2 font-bold">Your script, marked</h2>
        <ol className="ruled rounded-sm border border-rule">
          {result.points.map((p, i) => (
            <li key={p.id} className="grid grid-cols-[1fr_4.5rem] border-b border-rule/60 last:border-b-0">
              <div className="px-4 py-1">
                <p className={p.awarded > 0 ? "" : "text-muted"}>
                  {p.evidence || <em>Nothing in your answer for this point</em>}
                </p>
                <p className="text-[15px] leading-6 text-muted">
                  <span className="font-bold text-ink">{p.id}</span> · {TYPE_NAME[p.type]}, {p.maxMarks} mark{p.maxMarks > 1 ? "s" : ""}: {p.description}
                </p>
                <p className="pb-1 text-[15px] leading-6">{p.reason}</p>
                {p.adjustedByRules && (
                  <p className="pb-1 text-[15px] leading-6 text-red">Rule check: {p.adjustedByRules}</p>
                )}
                {attemptId && (
                  <button type="button" onClick={() => challenge(p.id)} disabled={!!flagged[p.id]}
                    className="mb-2 text-sm text-muted underline decoration-dotted underline-offset-4 hover:text-red disabled:no-underline">
                    {flagged[p.id] === "sent" ? "Challenge saved for review" : flagged[p.id] === "error" ? "Couldn't send. Try again later." : flagged[p.id] === "sending" ? "Sending…" : "I think this mark is wrong"}
                  </button>
                )}
              </div>
              <span className="hand ink-in pl-3 pt-1 text-[1.15rem] text-red" style={{ animationDelay: `${120 + i * 90}ms` }}>
                {markLabel(p)}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="border-l-4 border-red bg-red-wash px-5 py-4">
          <h2 className="font-bold">Practise next</h2>
          <p className="mt-1">{result.nextStep}</p>
          {lost.length > 0 && (
            <p className="mt-2 text-sm text-muted">Marks lost on: {lost.map((p) => p.id).join(", ")}</p>
          )}
        </div>
        <details className="rounded-sm border border-rule bg-sheet px-5 py-4">
          <summary className="cursor-pointer font-bold">What you submitted</summary>
          {answer.trim() && <pre className="mt-3 whitespace-pre-wrap font-sans">{answer}</pre>}
          <div className="mt-3 flex gap-3">
            {photos.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt={`Your working, photo ${i + 1}`} className="max-h-48 rounded-sm border border-rule" />
            ))}
          </div>
        </details>
      </section>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onRetry} className="rounded-md bg-ink px-5 py-3 font-bold text-paper">
          Try this question again
        </button>
        <Link href="/" className="rounded-md border border-ink/30 px-5 py-3 font-bold hover:border-red hover:text-red">
          Pick another question
        </Link>
        <Link href="/progress" className="px-2 py-3 text-muted underline underline-offset-4 hover:text-red">
          See your progress
        </Link>
      </div>
    </div>
  );
}
