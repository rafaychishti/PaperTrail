import MarkingDesk from "@/components/MarkingDesk";
import { isDemo } from "@/lib/mode";

export default function CustomPracticePage() {
  return (
    <div className="py-10">
      <h1 className="text-3xl font-bold">Mark your own question</h1>
      <p className="mt-2 max-w-[42rem] text-muted">
        Working through a past paper you already have? Paste the question and its mark scheme, then write your answer.
        Your material is sent to the configured AI marker and is never published. If database progress saving is enabled,
        your score and point-by-point feedback are stored anonymously; photos are never stored.
      </p>
      <div className="mt-8">
        <MarkingDesk questionId="custom" demo={isDemo()} />
      </div>
    </div>
  );
}
