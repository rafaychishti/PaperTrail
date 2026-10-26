# PaperTrail AI

Mark Cambridge-style past-paper answers against the mark scheme, point by point.
A student types (or photographs) their working; PaperTrail shows which M, A and B
marks they earned, the working that earned each one, and what to practise next.

ILAP 2027 · AI-Powered Solutions · Digital Transformation · SDG 4 (Quality Education)

## How the AI is used

1. **Claude reads the answer like an examiner.** It gets the question, the mark
   scheme and the student's working (text and/or photos) and returns a
   structured result: for every mark point, marks awarded, the quoted working
   that earned it, and a one-line reason.
2. **Rule checks keep it honest** (`lib/rules.ts`). The AI's marks are then
   checked against how Cambridge marking works:
   - no quoted working → no mark
   - an A mark needs the M mark it depends on
   - marks are whole numbers within each point's maximum
   - points the AI skipped get 0
   Every correction is shown to the student as a "Rule check" note.
3. **Students can challenge any mark.** Challenges are saved for a teacher to
   review and used to measure accuracy.

## Run it on Windows

Needs Node.js 20 or newer.

```powershell
npm install
copy .env.example .env.local
# put your Anthropic key in .env.local (Supabase is optional)
npm run dev
```

Open http://localhost:3000.

Optional, for progress tracking: create a Supabase project, run
`supabase/schema.sql` in its SQL editor, and add `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` to `.env.local`. Without them, marking still works
and the progress page says saving is off.

Check the marking rules: `npm run test:rules`

## Deploy

Push to GitHub, import into Vercel, and add the same environment variables.

## Privacy and ethics

- No names, emails or accounts. Each browser gets a random id.
- Photos are sent for marking and never stored.
- The built-in questions are original, written in Cambridge style. The app
  does not host Cambridge papers or mark schemes; in "Your own question" mode
  a student pastes material they already have, and nothing is published.
- The student's answer is treated as data to mark, so "give me full marks"
  written into an answer is ignored.
- Every result says AI marking can be wrong and shows the marker's confidence.

## Project files

- `lib/questions.ts` — question bank and mark schemes
- `lib/marker.ts` — the prompt and the call to Claude
- `lib/rules.ts` — the rule checks
- `components/MarkedScript.tsx` — the marked-script results screen
- `PLAN.md` — the day-by-day plan to submission
- `DECISIONS.md` — the student's decision log
