import Link from "next/link";
import { QUESTIONS } from "@/lib/questions";

export default function Home() {
  const subjects = Array.from(new Set(QUESTIONS.map((q) => `${q.subject} · ${q.paper}`)));

  return (
    <>
      <section className="grid gap-10 py-12 md:grid-cols-[1.1fr_1fr] md:items-center">
        <div>
          <h1 className="text-[2.4rem] font-bold leading-[1.1] tracking-tight md:text-5xl">
            Mark your past-paper answers the way an examiner would.
          </h1>
          <p className="mt-5 max-w-[34rem] text-lg text-muted">
            Write or photograph your working. PaperTrail checks it against every point in the mark scheme and shows
            exactly which marks you earned, which you lost, and why.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={`/practice/${QUESTIONS[0].id}`} className="rounded-md bg-ink px-5 py-3 font-bold text-paper hover:opacity-90">
              Try a question
            </Link>
            <Link href="/practice/custom" className="rounded-md border border-ink/30 px-5 py-3 font-bold hover:border-red hover:text-red">
              Mark your own question
            </Link>
          </div>
        </div>

        {/* A marked script: the product in one glance. */}
        <figure aria-label="Example of a marked answer" className="ruled rounded-sm border border-rule px-5 py-4 shadow-[0_1px_0_var(--rule)]">
          {[
            ["2x² − 12x + 7 = 2(x² − 6x) + 7", "B1 ✓"],
            ["= 2[(x − 3)² − 9] + 7", "M1 ✓"],
            ["= 2(x − 3)² − 2", "A0 ✗"],
            ["minimum value is −2", "B1 ft ✓"],
          ].map(([line, mark]) => (
            <div key={line} className="grid grid-cols-[1fr_4.5rem]">
              <span className="truncate pr-3">{line}</span>
              <span className="hand pl-3 text-[1.05rem] text-red">{mark}</span>
            </div>
          ))}
          <figcaption className="grid grid-cols-[1fr_4.5rem] text-muted">
            <span className="text-[15px] leading-snug">−9 × 2 is −18, so c = −11. Method right, one slip.</span>
            <span className="hand circled ml-2 mt-1 grid h-11 w-14 place-items-center text-xl text-red">3/4</span>
          </figcaption>
        </figure>
      </section>

      <section aria-labelledby="qs" className="mt-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-ink pb-2">
          <h2 id="qs" className="text-xl font-bold">Practice questions</h2>
          <p className="text-sm text-muted">{subjects.join(", ")} · original questions in Cambridge style</p>
        </div>
        <ul>
          {QUESTIONS.map((q) => (
            <li key={q.id} className="border-b border-rule">
              <Link href={`/practice/${q.id}`} className="grid grid-cols-[8.5rem_1fr_3rem] items-baseline gap-4 py-3.5 hover:text-red sm:grid-cols-[11rem_1fr_3rem]">
                <span className="font-bold">{q.topic}</span>
                <span className="truncate text-muted">{q.prompt.split("\n")[0]}</span>
                <span className="text-right tabular-nums">[{q.totalMarks}]</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
