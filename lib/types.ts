// Shared types for questions, mark schemes and marking results.

/** Cambridge mark types:
 *  M = method mark (for a correct method, even with arithmetic slips)
 *  A = accuracy mark (correct answer; depends on the method mark before it)
 *  B = independent mark (a correct statement or result on its own)
 */
export type MarkType = "M" | "A" | "B";

export type MarkPoint = {
  id: string; // e.g. "M1", "A1", "B1a" – unique within a question
  type: MarkType;
  marks: number;
  description: string; // what the examiner looks for
  dependsOn?: string[]; // ids of M marks this A mark needs
  followThrough?: boolean; // "ft": award if correct for the student's own earlier value
  /** Demo mode only (no API key): working that earns this point. Each inner
   *  list is one accepted form, and every piece in it must appear. Pieces are
   *  compared after normalising (no spaces, lower case, x² → x^2, − → -). */
  demoCues?: string[][];
};

export type Question = {
  id: string;
  subject: string; // e.g. "Mathematics 9709"
  paper: string; // e.g. "Pure Mathematics 1"
  topic: string;
  prompt: string;
  totalMarks: number;
  markScheme: MarkPoint[];
  commonErrors?: string[];
};

export type PointResult = {
  id: string;
  type: MarkType;
  maxMarks: number;
  description: string;
  awarded: number;
  evidence: string; // what in the student's answer earned (or failed) it
  reason: string;
  adjustedByRules?: string; // set when the rule check overrode the AI
};

export type MarkResult = {
  questionId: string;
  score: number;
  maxScore: number;
  points: PointResult[];
  summary: string;
  nextStep: string;
  confidence: "high" | "medium" | "low";
  readingIssues: string; // e.g. unclear handwriting in a photo
  ruleAdjustments: number;
  mode: "ai" | "demo"; // "demo" = keyword checks without the AI
};
