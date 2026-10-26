import type { MarkResult, Question } from "./types.ts";
import { applyRules, type AiPoint } from "./rules.ts";

// DEMO MODE — used when there is no ANTHROPIC_API_KEY.
// It does NOT use AI. It looks for the expected working for each mark point
// (the `demoCues` in lib/questions.ts), then runs the same rule checks as the
// real marker. This lets you test every screen without a key. It can't read
// photos, give follow-through marks or accept unusual-but-valid methods —
// that's what the AI is for.

export function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/⁻¹/g, "^-1")
    .replace(/\*\*/g, "^")
    .replace(/[−–—]/g, "-")
    .replace(/θ|theta|°/g, "")
    .replace(/\s+/g, "");
}

export function demoMark(q: Question, answerText: string, hadPhotos: boolean): MarkResult {
  const whole = normalise(answerText);
  const lines = answerText.split("\n").map((l) => l.trim()).filter(Boolean);

  const proposed: AiPoint[] = q.markScheme.map((p) => {
    const form = (p.demoCues ?? []).find((pieces) => pieces.every((piece) => whole.includes(normalise(piece))));
    if (!form) {
      return { id: p.id, awarded: 0, evidence: "", reason: `Couldn't find this step in your working: ${p.description}.` };
    }
    const first = normalise(form[0]);
    const line = lines.find((l) => normalise(l).includes(first)) ?? form.join(" … ");
    return { id: p.id, awarded: p.marks, evidence: line.slice(0, 120), reason: "This step matches the mark scheme." };
  });

  const ruled = applyRules(q.markScheme, proposed, q.totalMarks);
  const lost = ruled.points.filter((p) => p.awarded < p.maxMarks);

  const summary =
    ruled.score === ruled.maxScore
      ? "Every mark point was found in your working."
      : ruled.score === 0
        ? "None of the expected steps were found. Write each step on its own line, as you would in the exam."
        : `You earned ${ruled.score} of ${ruled.maxScore}. Look at the points marked ✗ to see which steps were missing.`;

  return {
    questionId: q.id,
    score: ruled.score,
    maxScore: ruled.maxScore,
    points: ruled.points,
    summary,
    nextStep:
      lost.length && q.commonErrors?.length
        ? `Watch out for a common mistake on this question: ${q.commonErrors[0].charAt(0).toLowerCase()}${q.commonErrors[0].slice(1)}.`
        : "Try a question on a different topic.",
    confidence: "medium",
    readingIssues: hadPhotos ? "Demo marking can't read photos, so only your typed working was marked." : "",
    ruleAdjustments: ruled.adjustments,
    mode: "demo",
  };
}
