// Run with: npm run test:rules
// Checks that the rule layer corrects the AI in the ways it should.
import assert from "node:assert/strict";
import { applyRules, schemeFromAi } from "../lib/rules.ts";
import { QUESTIONS } from "../lib/questions.ts";

const q = QUESTIONS.find((x) => x.id === "p1-quad-01")!;
let passed = 0;
const test = (name: string, fn: () => void) => {
  fn();
  passed++;
  console.log("✓", name);
};

test("full marks pass through unchanged", () => {
  const r = applyRules(q.markScheme, [
    { id: "B1", awarded: 1, evidence: "a = 2", reason: "" },
    { id: "M1", awarded: 1, evidence: "2[(x−3)² − 9] + 7", reason: "" },
    { id: "A1", awarded: 1, evidence: "2(x−3)² − 11", reason: "" },
    { id: "B2", awarded: 1, evidence: "min −11", reason: "" },
  ], q.totalMarks);
  assert.equal(r.score, 4);
  assert.equal(r.adjustments, 0);
});

test("A mark removed when its M mark is not earned", () => {
  const r = applyRules(q.markScheme, [
    { id: "B1", awarded: 1, evidence: "a = 2", reason: "" },
    { id: "M1", awarded: 0, evidence: "", reason: "" },
    { id: "A1", awarded: 1, evidence: "2(x−3)² − 11", reason: "" },
    { id: "B2", awarded: 1, evidence: "−11", reason: "" },
  ], q.totalMarks);
  assert.equal(r.points.find((p) => p.id === "A1")!.awarded, 0);
  assert.equal(r.score, 2);
});

test("mark with no quoted evidence is withheld", () => {
  const r = applyRules(q.markScheme, [
    { id: "B1", awarded: 1, evidence: "  ", reason: "" },
    { id: "M1", awarded: 0, evidence: "", reason: "" },
    { id: "A1", awarded: 0, evidence: "", reason: "" },
    { id: "B2", awarded: 0, evidence: "", reason: "" },
  ]);
  assert.equal(r.score, 0);
  assert.equal(r.adjustments, 1);
});

test("over-generous and missing points are corrected", () => {
  const r = applyRules(q.markScheme, [
    { id: "b1", awarded: 5, evidence: "a=2", reason: "" }, // too many, lower-case id
    { id: "M1", awarded: 1, evidence: "completed square", reason: "" },
    // A1 missing
    { id: "B2", awarded: 1, evidence: "−11", reason: "" },
  ], q.totalMarks);
  assert.equal(r.points[0].awarded, 1);
  assert.equal(r.points.find((p) => p.id === "A1")!.awarded, 0);
  assert.equal(r.score, 3);
  assert.equal(r.adjustments, 2);
});

test("multi-dependency A mark (n = 22) needs both M marks", () => {
  const s = QUESTIONS.find((x) => x.id === "p1-seq-01")!;
  const r = applyRules(s.markScheme, [
    { id: "M1", awarded: 1, evidence: "10(14+76)", reason: "" },
    { id: "A1", awarded: 1, evidence: "900", reason: "" },
    { id: "M2", awarded: 1, evidence: "2n²+5n>1000", reason: "" },
    { id: "M3", awarded: 0, evidence: "", reason: "" },
    { id: "A2", awarded: 1, evidence: "n = 22", reason: "" },
  ]);
  assert.equal(r.score, 3);
});

test("pasted scheme: A mark defaults to depending on the M before it", () => {
  const ai = [
    { id: "M1", type: "M", max_marks: 1, description: "method", awarded: 0, evidence: "", reason: "" },
    { id: "A1", type: "A", max_marks: 1, description: "answer", awarded: 1, evidence: "x = 4", reason: "" },
  ];
  const r = applyRules(schemeFromAi(ai), ai);
  assert.equal(r.score, 0);
});

test("every built-in scheme adds up to its total", () => {
  for (const x of QUESTIONS) {
    assert.equal(x.markScheme.reduce((s, p) => s + p.marks, 0), x.totalMarks, x.id);
    assert.equal(new Set(x.markScheme.map((p) => p.id)).size, x.markScheme.length, x.id);
  }
});

console.log(`\n${passed} checks passed`);
