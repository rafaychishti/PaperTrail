# Plan to submission (deadline 31 Oct, target 30 Oct)

The student leads every day. Each day ends with an entry in `DECISIONS.md`.

## Mon 26 Oct — scope and core
- [ ] Student picks the subject and paper, and writes or chooses 8–10 questions with mark schemes
- [ ] Student writes the one-sentence problem statement (who struggles, with what, how they know)
- [x] Working core: marking engine, rule checks, practice screen, marked-script results, progress page
- [ ] Run it locally on Windows with an API key; student marks 3 of their own answers

## Tue 27 Oct — deploy and accuracy test
- [ ] Supabase project + `schema.sql`; deploy to Vercel
- [ ] Accuracy test: collect 20 real answers, have a teacher mark them, run them through PaperTrail
- [ ] Record results in `accuracy-test.csv`: agreement on total, and on each mark point
- [ ] Student adjusts questions, mark-scheme wording or prompt where it disagreed; re-run

## Wed 28 Oct — user testing (evidence of impact)
- [ ] 8–15 classmates each do 2–3 questions, then retry one after reading the feedback
- [ ] 3-question survey: was the feedback clear? did you understand why you lost marks? would you use it?
- [ ] Pull first-try vs retry scores (`improvement_by_attempt` view in Supabase)
- [ ] Fix the top 3 problems testers hit

## Thu 29 Oct — write-up and video
- [ ] Write-up, all 7 stages: problem → solution design → prototype → evidence of impact → way forward → intent/SDG link → scalability
- [ ] Video, 3–5 min, presented by the student:
  - 0:00 the problem, in the student's words (30s)
  - 0:30 what PaperTrail does and where the AI sits (45s)
  - 1:15 live demo: answer a question with one slip, show the marked script, challenge a mark (90s)
  - 2:45 accuracy and testing numbers (45s)
  - 3:30 responsible AI: rule checks, no stored photos, no logins, "can be wrong" (30s)
  - 4:00 what's next and how it scales (30s)

## Fri 30 Oct — submit
- [ ] Fresh run-through of the live link on a phone
- [ ] Submit the form; keep a copy of everything submitted
- 31 Oct is buffer only

## How this answers the 8 judging criteria
| Criterion | Where it shows |
|---|---|
| Intent alignment | Digital Transformation: replaces slow hand-marking of practice papers with instant, point-by-point feedback |
| Problem and users | Student's problem statement + survey of real students |
| Effective use of AI | AI reads working (incl. photos) against a mark scheme, with rule checks on top |
| Innovation | Marks shown on a marked script, M/A/B logic enforced, mark challenges |
| Functionality | Live link, working end to end |
| Impact and scalability | First-try vs retry scores; any subject with a mark scheme |
| Ethical and responsible AI | No accounts, photos not stored, prompt-injection guard, confidence and "can be wrong" notices, original questions |
| Presentation | Student-led video and demo |
