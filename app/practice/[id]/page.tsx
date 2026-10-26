import { notFound } from "next/navigation";
import { getQuestion, QUESTIONS } from "@/lib/questions";
import MarkingDesk from "@/components/MarkingDesk";
import { isDemo } from "@/lib/mode";

export function generateStaticParams() {
  return QUESTIONS.map((q) => ({ id: q.id }));
}

export default async function PracticePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const q = getQuestion(id);
  if (!q) notFound();

  return (
    <div className="py-10">
      <p className="text-sm text-muted">{q.subject} · {q.paper} · {q.topic}</p>
      {/* Printed like a question paper: text left, marks right */}
      <div className="mt-3 grid grid-cols-[1fr_auto] gap-6 border-y-2 border-ink py-5">
        <div className="whitespace-pre-line text-lg">{q.prompt}</div>
        <span className="self-end font-bold tabular-nums">[{q.totalMarks}]</span>
      </div>
      <div className="mt-8">
        <MarkingDesk questionId={q.id} demo={isDemo()} />
      </div>
    </div>
  );
}
