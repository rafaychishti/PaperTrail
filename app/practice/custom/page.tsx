import MarkingDesk from "@/components/MarkingDesk";

export default function CustomPracticePage() {
  return (
    <div className="py-10">
      <h1 className="text-3xl font-bold">Mark your own question</h1>
      <p className="mt-2 max-w-[42rem] text-muted">
        Working through a past paper you already have? Paste the question and its mark scheme, then write your answer.
        Nothing you paste is published or shared.
      </p>
      <div className="mt-8">
        <MarkingDesk questionId="custom" />
      </div>
    </div>
  );
}
