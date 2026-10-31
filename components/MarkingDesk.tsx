"use client";

import { useRef, useState } from "react";
import type { MarkResult } from "@/lib/types";
import { getAnonId, resizePhoto, saveLocalAttempt } from "@/lib/client";
import MarkedScript from "./MarkedScript";

type Photo = { mediaType: "image/jpeg"; data: string; preview: string };

export default function MarkingDesk({ questionId, demo = false }: { questionId: string; demo?: boolean }) {
  const isCustom = questionId === "custom";
  const [customQuestion, setCustomQuestion] = useState("");
  const [customScheme, setCustomScheme] = useState("");
  const [answer, setAnswer] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<MarkResult | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function addPhotos(files: FileList | null) {
    if (!files) return;
    setError("");
    try {
      const next = [...photos];
      for (const f of Array.from(files).slice(0, 2 - photos.length)) next.push(await resizePhoto(f));
      setPhotos(next);
    } catch (e) {
      setError((e as Error).message);
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/mark", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          questionId,
          answerText: answer,
          images: photos.map(({ mediaType, data }) => ({ mediaType, data })),
          customQuestion,
          customMarkScheme: customScheme,
          anonId: getAnonId(),
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Marking failed.");
      if (!json?.result) throw new Error("The server returned an invalid marking. Please try again.");
      setResult(json.result);
      setAttemptId(json.attemptId);
      setSaveWarning(typeof json.saveWarning === "string" ? json.saveWarning : "");
      if (!json.saved) {
        saveLocalAttempt({ question_id: json.result.questionId, topic: json.topic, score: json.result.score, max_score: json.result.maxScore });
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function tryAgain() {
    setResult(null);
    setAttemptId(null);
    setSaveWarning("");
  }

  if (result) {
    return <MarkedScript result={result} answer={answer} photos={photos.map((p) => p.preview)} attemptId={attemptId} saveWarning={saveWarning} onRetry={tryAgain} />;
  }

  const canSubmit = !busy && (answer.trim() || (!demo && photos.length)) && (!isCustom || (customQuestion.trim() && customScheme.trim()));

  if (demo && isCustom) {
    return (
      <p className="max-w-[42rem] rounded-sm bg-wash px-5 py-4">
        Marking your own question needs the AI, which switches on once an API key is added. Until then, try one of the
        built-in questions.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {isCustom && (
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="font-bold">Question</span>
            <span className="block text-sm text-muted">Paste or type it, including the marks, e.g. [4].</span>
            <textarea value={customQuestion} onChange={(e) => setCustomQuestion(e.target.value)} rows={6}
              className="mt-2 w-full rounded-sm border border-rule bg-sheet p-3" />
          </label>
          <label className="block">
            <span className="font-bold">Mark scheme for this question</span>
            <span className="block text-sm text-muted">Copy the lines from your mark scheme, e.g. “M1 for…, A1 x = 4”.</span>
            <textarea value={customScheme} onChange={(e) => setCustomScheme(e.target.value)} rows={6}
              className="mt-2 w-full rounded-sm border border-rule bg-sheet p-3" />
          </label>
        </div>
      )}

      <div>
        <label htmlFor="answer" className="font-bold">Your answer</label>
        <p className="text-sm text-muted">Show your working, one step per line, as you would in the exam.</p>
        <div className="ruled mt-2 rounded-sm border border-rule pl-4 pr-[5rem]">
          <textarea id="answer" value={answer} onChange={(e) => setAnswer(e.target.value)} rows={9} maxLength={6000}
            aria-describedby="answer-count"
            placeholder="Start writing here…" className="ruled-input block w-full outline-none placeholder:text-muted/60" />
        </div>
        <p id="answer-count" className="mt-1 text-right text-sm text-muted">{answer.length.toLocaleString()} / 6,000 characters</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input ref={fileRef} type="file" accept="image/*" capture="environment" multiple className="sr-only" id="photo"
          onChange={(e) => addPhotos(e.target.files)} disabled={demo || photos.length >= 2} />
        <label htmlFor="photo"
          className={`cursor-pointer rounded-md border border-ink/30 px-4 py-2.5 text-[15px] hover:border-red hover:text-red ${demo || photos.length >= 2 ? "pointer-events-none opacity-40" : ""}`}>
          Add a photo of your working
        </label>
        {photos.map((p, i) => (
          <span key={i} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.preview} alt={`Photo ${i + 1} of your working`} className="h-14 w-14 rounded-sm border border-rule object-cover" />
            <button type="button" onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
              className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-ink text-xs text-paper" aria-label={`Remove photo ${i + 1}`}>
              ×
            </button>
          </span>
        ))}
        <span className="text-sm text-muted">
          {demo ? "Photo marking needs the AI. In demo mode, type your working." : "Up to 2 photos. They’re used for marking only and never saved."}
        </span>
      </div>

      {error && <p role="alert" className="rounded-sm bg-red-wash px-4 py-3 text-red">{error}</p>}

      <button type="button" onClick={submit} disabled={!canSubmit}
        className="rounded-md bg-red px-6 py-3 font-bold text-paper disabled:cursor-not-allowed disabled:opacity-40">
        {busy ? "Marking against the scheme…" : "Mark my answer"}
      </button>
    </div>
  );
}
