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

## Choosing the AI

PaperTrail works with either:

- **Free: OpenRouter** (`OPENROUTER_API_KEY`). Uses Google's open
  **Gemma 4 31B** model (`google/gemma-4-31b-it:free`), with Gemma 4 26B as a
  backup. It reads photos and returns structured marking. Requests are only
  sent to hosts that don't train on prompts (`data_collection: "deny"`).
  Free limit: about 50 markings a day and 20 a minute.
- **Paid: Claude** (`ANTHROPIC_API_KEY`). The most accurate option, and the
  cheapest Claude model is `claude-haiku-5-5`.

If both keys are set, OpenRouter is used. Either way, the same rule checks run
on the AI's marks.

## Demo mode (no API key needed)

With no AI key at all, PaperTrail runs in **demo mode**: every screen
works, but marking checks your typed working against the expected steps for
each mark point (`demoCues` in `lib/questions.ts`) instead of using the AI.
The same rule checks run on top. A banner shows when demo mode is on, and
progress is saved in your browser.

Demo mode can't read photos, give follow-through (ft) marks, accept
unusual-but-valid methods, or mark your own pasted questions. Those need the
AI. **Demo mode is for testing only. The ILAP entry must use real AI marking.**

To switch to AI marking, add the key to `.env.local` and restart `npm run dev`
(or redeploy on Vercel).

## Run it on Windows

Needs Node.js 20 or newer.

```powershell
npm install
copy .env.example .env.local
npm run dev        # starts in demo mode; add a key to .env.local for AI marking
```

Open http://localhost:3000.

Optional, for progress tracking: create a Supabase project, run
`supabase/schema.sql` in its SQL editor, and add `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` to `.env.local`. Without them, marking still works
and progress stays in this browser.

## Optional Google sign-in

1. In Supabase, enable **Google** under **Authentication → Providers** and enter
   the OAuth client ID and secret from your Google Cloud project.
2. In Google Cloud, add the Supabase callback URL shown by that provider as an
   authorized redirect URI.
3. In **Authentication → URL Configuration**, add
   `http://localhost:3000/auth/callback` and
   `https://papertrail-ai-rouge.vercel.app/auth/callback` to the redirect URL
   allow list. Set the site URL to your production deployment URL.
4. Run the current `supabase/schema.sql` in the SQL editor. It safely adds the
   nullable account link to existing attempts tables.

Sign-in is optional. When signed in, new attempts are linked to the Supabase
user ID and progress can follow the account across browsers. Existing anonymous
attempts on the same browser remain visible. Google passwords are never handled
by PaperTrail. Keep Supabase service-role credentials server-side only.

Check the marking rules: `npm run test:rules`

## Backend

The Next.js API routes handle marking, anonymous progress, and mark challenges.
Supabase is optional: without it, scores are kept in the current browser;
with it, attempts and challenges are stored in the database. The service-role
key is used only by server routes and must never be exposed as a `NEXT_PUBLIC_`
variable. Run `supabase/schema.sql` before enabling database storage.

`GET /api/health` reports whether the app is in demo or AI mode and whether
Supabase is connected. It does not expose credentials or database error details.
If a database write fails after marking, the result is still shown and a warning
explains that progress was saved locally instead.

When enabling Supabase, scores and point-by-point marking feedback are stored
anonymously or linked to the signed-in Supabase user so progress and challenges
work. Photos are sent to the configured AI provider for marking but are never stored.

## Deploy

Push to GitHub, import into Vercel, and add the same server-side environment
variables (`ANTHROPIC_API_KEY` or `OPENROUTER_API_KEY`; optionally
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`). Never commit `.env.local` or
put server keys in client-side environment variables.

## Privacy and ethics

- No account is required. Anonymous use gets a random browser id; optional Google
  sign-in uses the account email for authentication and links progress.
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
