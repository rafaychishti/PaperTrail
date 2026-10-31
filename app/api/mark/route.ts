import { NextResponse } from "next/server";
import { getQuestion } from "@/lib/questions";
import { markAnswer, type MarkInput } from "@/lib/marker";
import { demoMark } from "@/lib/demo-marker";
import { isDemo } from "@/lib/mode";
import { db, isValidAnonId } from "@/lib/supabase";

export const maxDuration = 60;

const MAX_ANSWER = 6000;
const MAX_IMAGES = 2;
const MAX_IMAGE_B64 = 2_500_000; // ~1.8 MB per photo after browser resizing
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "The request could not be read." }, { status: 400 });
  }

  const questionId = String(body.questionId ?? "");
  const question = questionId === "custom" ? null : getQuestion(questionId);
  if (questionId !== "custom" && !question) {
    return NextResponse.json({ error: "That question doesn't exist." }, { status: 404 });
  }

  const answerText = String(body.answerText ?? "").slice(0, MAX_ANSWER);
  const rawImages = Array.isArray(body.images) ? body.images.slice(0, MAX_IMAGES) : [];
  const images: MarkInput["images"] = [];
  for (const img of rawImages) {
    const mediaType = img?.mediaType;
    const data = typeof img?.data === "string" ? img.data : "";
    if (!IMAGE_TYPES.includes(mediaType) || !data || data.length > MAX_IMAGE_B64) {
      return NextResponse.json({ error: "Photos must be JPG, PNG or WebP and under 2 MB." }, { status: 400 });
    }
    images.push({ mediaType, data });
  }
  if (!answerText.trim() && images.length === 0) {
    return NextResponse.json({ error: "Type your answer or add a photo of your working first." }, { status: 400 });
  }

  const customQuestion = String(body.customQuestion ?? "").slice(0, 4000);
  const customMarkScheme = String(body.customMarkScheme ?? "").slice(0, 6000);
  if (!question && (!customQuestion.trim() || !customMarkScheme.trim())) {
    return NextResponse.json({ error: "Paste both the question and its mark scheme." }, { status: 400 });
  }

  let result;
  if (isDemo()) {
    if (!question) {
      return NextResponse.json(
        { error: "Marking your own question needs the AI, which is switched on once an API key is added. Try a built-in question for now." },
        { status: 400 },
      );
    }
    if (!answerText.trim()) {
      return NextResponse.json({ error: "Demo marking can't read photos. Type your working to try it." }, { status: 400 });
    }
    result = demoMark(question, answerText, images.length > 0);
  } else {
    try {
      result = await markAnswer({ question: question ?? null, customQuestion, customMarkScheme, answerText, images });
    } catch (err) {
      console.error("mark failed", err);
      const msg = (err as Error).message || "";
      if (msg.startsWith("The free AI model is busy")) return NextResponse.json({ error: msg }, { status: 429 });
      return NextResponse.json({ error: "Marking failed. Check your connection and try again." }, { status: 502 });
    }
  }

  // Log the attempt anonymously for the progress page and the impact study.
  // Photos are never stored.
  let attemptId: string | null = null;
  const anonId = body.anonId;
  const supabase = db();
  if (supabase && isValidAnonId(anonId)) {
    const { data, error } = await supabase
      .from("attempts")
      .insert({
        anon_id: anonId,
        question_id: result.questionId,
        topic: question?.topic ?? "Own question",
        score: result.score,
        max_score: result.maxScore,
        confidence: result.confidence,
        answer_text: answerText || null,
        had_photo: images.length > 0,
        result,
      })
      .select("id")
      .single();
    if (error) console.error("attempt log failed", error.message);
    attemptId = data?.id ?? null;
  }

  return NextResponse.json({ result, attemptId, topic: question?.topic ?? "Own question", saved: !!attemptId });
}
