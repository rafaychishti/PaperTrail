import type { Question } from "./types";

// Original practice questions written in the style of Cambridge 9709 Paper 1.
// They are NOT copied from Cambridge papers. Replace or extend these with the
// student's own questions — the subject and set are the student's decision.

export const QUESTIONS: Question[] = [
  {
    id: "p1-quad-01",
    subject: "Mathematics 9709",
    paper: "Pure Mathematics 1",
    topic: "Quadratics",
    prompt:
      "Express 2x² − 12x + 7 in the form a(x + b)² + c, where a, b and c are constants.\nHence state the minimum value of 2x² − 12x + 7.",
    totalMarks: 4,
    markScheme: [
      { id: "B1", type: "B", marks: 1, description: "a = 2 stated or used" },
      { id: "M1", type: "M", marks: 1, description: "Completes the square with b = −3, e.g. 2[(x − 3)² − 9] + 7 or equivalent" },
      { id: "A1", type: "A", marks: 1, description: "2(x − 3)² − 11 (c = −11)", dependsOn: ["M1"] },
      { id: "B2", type: "B", marks: 1, description: "Minimum value −11 (follow through their c)", followThrough: true },
    ],
    commonErrors: ["Forgetting to multiply the −9 by 2, giving c = −2", "Giving the x-value 3 instead of the minimum value"],
  },
  {
    id: "p1-diff-01",
    subject: "Mathematics 9709",
    paper: "Pure Mathematics 1",
    topic: "Differentiation",
    prompt:
      "A curve has equation y = x³ − 6x² + 9x + 2.\nFind the coordinates of the stationary points of the curve and determine the nature of each one.",
    totalMarks: 6,
    markScheme: [
      { id: "M1", type: "M", marks: 1, description: "Differentiates, with at least two terms correct" },
      { id: "A1", type: "A", marks: 1, description: "dy/dx = 3x² − 12x + 9", dependsOn: ["M1"] },
      { id: "M2", type: "M", marks: 1, description: "Sets their dy/dx = 0 and solves a three-term quadratic" },
      { id: "A2", type: "A", marks: 1, description: "x = 1 and x = 3", dependsOn: ["M2"] },
      { id: "A3", type: "A", marks: 1, description: "Points (1, 6) and (3, 2)", dependsOn: ["M2"] },
      { id: "B1", type: "B", marks: 1, description: "(1, 6) maximum and (3, 2) minimum, with a valid reason (e.g. d²y/dx² = −6 and +6)" },
    ],
    commonErrors: ["Not substituting x back into the original equation for y", "Stating nature without any justification"],
  },
  {
    id: "p1-int-01",
    subject: "Mathematics 9709",
    paper: "Pure Mathematics 1",
    topic: "Integration",
    prompt: "A curve has gradient dy/dx = 6x² − 4x + 1 and passes through the point (1, 5).\nFind the equation of the curve.",
    totalMarks: 4,
    markScheme: [
      { id: "M1", type: "M", marks: 1, description: "Integrates: power increased by one in at least one term" },
      { id: "A1", type: "A", marks: 1, description: "2x³ − 2x² + x (all three terms correct)", dependsOn: ["M1"] },
      { id: "M2", type: "M", marks: 1, description: "Substitutes (1, 5) into their integrated expression including + c" },
      { id: "A2", type: "A", marks: 1, description: "y = 2x³ − 2x² + x + 4", dependsOn: ["M2"] },
    ],
    commonErrors: ["Omitting the constant of integration", "Differentiating instead of integrating"],
  },
  {
    id: "p1-seq-01",
    subject: "Mathematics 9709",
    paper: "Pure Mathematics 1",
    topic: "Series",
    prompt:
      "An arithmetic progression has first term 7 and common difference 4.\n(a) Find the sum of the first 20 terms.\n(b) Find the smallest value of n for which the sum of the first n terms exceeds 1000.",
    totalMarks: 5,
    markScheme: [
      { id: "M1", type: "M", marks: 1, description: "Uses Sₙ = n/2 [2a + (n − 1)d] with a = 7, d = 4, n = 20" },
      { id: "A1", type: "A", marks: 1, description: "S₂₀ = 900", dependsOn: ["M1"] },
      { id: "M2", type: "M", marks: 1, description: "Forms n/2 [14 + 4(n − 1)] > 1000 or = 1000, e.g. 2n² + 5n − 1000" },
      { id: "M3", type: "M", marks: 1, description: "Solves their quadratic or uses a valid trial of consecutive n values" },
      { id: "A2", type: "A", marks: 1, description: "n = 22", dependsOn: ["M2", "M3"] },
    ],
    commonErrors: ["Giving n = 21.15 or rounding down to 21", "Using the nth-term formula instead of the sum formula"],
  },
  {
    id: "p1-trig-01",
    subject: "Mathematics 9709",
    paper: "Pure Mathematics 1",
    topic: "Trigonometry",
    prompt: "Solve the equation 2 sin²θ = 3 cos θ for 0° ≤ θ ≤ 360°.",
    totalMarks: 5,
    markScheme: [
      { id: "M1", type: "M", marks: 1, description: "Uses sin²θ = 1 − cos²θ" },
      { id: "A1", type: "A", marks: 1, description: "2cos²θ + 3cosθ − 2 = 0", dependsOn: ["M1"] },
      { id: "M2", type: "M", marks: 1, description: "Solves their three-term quadratic in cos θ" },
      { id: "A2", type: "A", marks: 1, description: "θ = 60°", dependsOn: ["M2"] },
      { id: "A3", type: "A", marks: 1, description: "θ = 300° (follow through 360° − their first angle), no extra solutions in range", dependsOn: ["M2"], followThrough: true },
    ],
    commonErrors: ["Trying to solve cos θ = −2", "Missing the second solution in the fourth quadrant"],
  },
  {
    id: "p1-coord-01",
    subject: "Mathematics 9709",
    paper: "Pure Mathematics 1",
    topic: "Coordinate geometry",
    prompt: "The points A and B have coordinates (1, 3) and (7, −1).\nFind the equation of the perpendicular bisector of AB.",
    totalMarks: 4,
    markScheme: [
      { id: "B1", type: "B", marks: 1, description: "Midpoint (4, 1)" },
      { id: "B2", type: "B", marks: 1, description: "Gradient of AB = −2/3" },
      { id: "M1", type: "M", marks: 1, description: "Uses perpendicular gradient −1/m through their midpoint" },
      { id: "A1", type: "A", marks: 1, description: "y = (3/2)x − 5 or 3x − 2y − 10 = 0 or equivalent", dependsOn: ["M1"] },
    ],
    commonErrors: ["Using the gradient of AB rather than the perpendicular gradient", "Using point A instead of the midpoint"],
  },
  {
    id: "p1-binom-01",
    subject: "Mathematics 9709",
    paper: "Pure Mathematics 1",
    topic: "Binomial expansion",
    prompt: "Find the coefficient of x² in the expansion of (2 − 3x)⁵.",
    totalMarks: 3,
    markScheme: [
      { id: "B1", type: "B", marks: 1, description: "5C2 = 10 seen or used" },
      { id: "M1", type: "M", marks: 1, description: "Correct term structure: 5C2 × 2³ × (−3x)² or (−3)²" },
      { id: "A1", type: "A", marks: 1, description: "720", dependsOn: ["M1"] },
    ],
    commonErrors: ["Forgetting to square the 3", "Using 2² instead of 2³"],
  },
  {
    id: "p1-func-01",
    subject: "Mathematics 9709",
    paper: "Pure Mathematics 1",
    topic: "Functions",
    prompt: "The functions f and g are defined by\nf(x) = 3x − 2 for x ∈ ℝ,\ng(x) = 1 / (x + 1) for x ≠ −1.\nFind fg(x) and f⁻¹(x).",
    totalMarks: 4,
    markScheme: [
      { id: "M1", type: "M", marks: 1, description: "Substitutes g into f: 3 × g(x) − 2" },
      { id: "A1", type: "A", marks: 1, description: "fg(x) = 3/(x + 1) − 2 or (1 − 2x)/(x + 1)", dependsOn: ["M1"] },
      { id: "M2", type: "M", marks: 1, description: "Attempts to make x the subject of y = 3x − 2 (or swaps x and y)" },
      { id: "A2", type: "A", marks: 1, description: "f⁻¹(x) = (x + 2)/3", dependsOn: ["M2"] },
    ],
    commonErrors: ["Finding gf instead of fg", "Writing f⁻¹(x) as 1/(3x − 2)"],
  },
];

export function getQuestion(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id);
}
