import { NextResponse } from "next/server";
import { getQuestion } from "@/lib/questions";
import { markAnswer, type MarkInput } from "@/lib/marker";
import { demoMark } from "@/lib/demo-marker";
import { isDemo } from "@/lib/mode";
import { db, isValidAnonId } from "@/lib/supabase";
import { readJsonObject } from "@/lib/request";
import { getAuthenticatedUser } from "@/lib/supabase-auth";

export const maxDuration = 60;

const MAX_ANSWER = 6000;
const MAX_IMAGES = 2;
const MAX_IMAGE_B64 = 2_500_000; // ~1.8 MB per photo after browser resizing
const MAX_IMAGES_TOTAL_B64 = 3_800_000;
const MAX_REQUEST_BYTES = 4_200_000;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export async function POST(req: Request) {
  const parsed = await readJsonObject(req, MAX_REQUEST_BYTES);
  if (parsed.error === "too_large") {
    return NextResponse.json({ error: "This request is too large. Try a smaller photo." }, { status: 413 });
  }
  if (parsed.error) return NextResponse.json({ error: "The request could not be read." }, { status: 400 });
  const { body } = parsed;

  const questionId = typeof body.questionId === "string" ? body.questionId : "";
  const question = questionId === "custom" ? null : getQuestion(questionId);
  if (questionId !== "custom" && !question) {
    return NextResponse.json({ error: "That question doesn't exist." }, { status: 404 });
  }

  const answerText = typeof body.answerText === "string" ? body.answerText : "";
  if (answerText.length > MAX_ANSWER) {
    return NextResponse.json({ error: "Your typed answer is too long. Keep it under 6,000 characters." }, { status: 400 });
  }

  if (body.images !== undefined && !Array.isArray(body.images)) {
    return NextResponse.json({ error: "Photos must be uploaded as a list." }, { status: 400 });
  }
  const rawImages = Array.isArray(body.images) ? body.images : [];
  if (rawImages.length > MAX_IMAGES) {
    return NextResponse.json({ error: "Add no more than 2 photos." }, { status: 400 });
  }
  const images: MarkInput["images"] = [];
  let totalImageB64 = 0;
  for (const img of rawImages) {
    if (!img || typeof img !== "object" || Array.isArray(img)) {
      return NextResponse.json({ error: "A photo could not be read." }, { status: 400 });
    }
    const image = img as Record<string, unknown>;
    const mediaType = IMAGE_TYPES.find((type) => type === image.mediaType);
    const data = typeof image.data === "string" ? image.data : "";
    if (
      !mediaType ||
      !data ||
      data.length > MAX_IMAGE_B64 ||
      data.length % 4 === 1 ||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(data)
    ) {
      return NextResponse.json({ error: "Photos must be JPG, PNG or WebP and under 2 MB." }, { status: 400 });
    }
    totalImageB64 += data.length;
    if (totalImageB64 > MAX_IMAGES_TOTAL_B64) {
      return NextResponse.json({ error: "Your photos are too large. Try smaller images." }, { status: 413 });
    }
    images.push({ mediaType, data });
  }
  if (!answerText.trim() && images.length === 0) {
    return NextResponse.json({ error: "Type your answer or add a photo of your working first." }, { status: 400 });
  }

  const customQuestion = typeof body.customQuestion === "string" ? body.customQuestion : "";
  const customMarkScheme = typeof body.customMarkScheme === "string" ? body.customMarkScheme : "";
  if (customQuestion.length > 4000 || customMarkScheme.length > 6000) {
    return NextResponse.json({ error: "Your question or mark scheme is too long." }, { status: 400 });
  }
  if (!question && (!customQuestion.trim() || !customMarkScheme.trim())) {
    return NextResponse.json({ error: "Paste both the question and its mark scheme." }, { status: 400 });
  }

  let user;
  try {
    user = await getAuthenticatedUser();
  } catch (error) {
    console.error("mark auth check failed", error);
    return NextResponse.json({ error: "Couldn't verify your sign-in. Please refresh and try again." }, { status: 503 });
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
  let saveWarning: string | null = null;
  const anonId = body.anonId;
  const supabase = db();
  if (supabase && (isValidAnonId(anonId) || user)) {
    const { data, error } = await supabase
      .from("attempts")
      .insert({
        anon_id: isValidAnonId(anonId) ? anonId : null,
        user_id: user?.id ?? null,
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
    if (error) {
      console.error("attempt log failed", error.message);
      saveWarning = "Your answer was marked, but progress could not be saved to the database. A copy was saved in this browser.";
    }
    attemptId = data?.id ?? null;
  } else {
    saveWarning = "Your answer was marked. Progress is saved in this browser on this device only.";
  }

  return NextResponse.json({
    result,
    attemptId,
    topic: question?.topic ?? "Own question",
    saved: !!attemptId,
    saveWarning,
  });
}
