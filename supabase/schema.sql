-- PaperTrail AI — run once in the Supabase SQL editor.
-- Google accounts are optional; anonymous browser ids still work without sign-in.
-- Photos of working are never stored.

create table if not exists public.attempts (
  id           uuid primary key default gen_random_uuid(),
  anon_id      text,
  user_id      uuid references auth.users(id) on delete set null,
  question_id  text not null,
  topic        text not null,
  score        int  not null,
  max_score    int  not null,
  confidence   text not null,
  answer_text  text,
  had_photo    boolean not null default false,
  result       jsonb not null,
  created_at   timestamptz not null default now()
);
alter table public.attempts add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.attempts alter column anon_id drop not null;
create index if not exists attempts_anon_idx on public.attempts (anon_id, created_at);
create index if not exists attempts_user_idx on public.attempts (user_id, created_at);

create table if not exists public.flags (
  id          uuid primary key default gen_random_uuid(),
  attempt_id  uuid not null references public.attempts(id) on delete cascade,
  anon_id     text,
  point_id    text not null,
  note        text,
  reviewed    boolean not null default false,
  teacher_agrees boolean,
  created_at  timestamptz not null default now()
);
alter table public.flags alter column anon_id drop not null;
create index if not exists flags_review_idx on public.flags (reviewed, created_at);
create index if not exists flags_attempt_point_idx on public.flags (attempt_id, point_id);

-- Row-level security on, no policies: the public anon key can read or write
-- nothing. Only the server (service role key) reaches these tables.
alter table public.attempts enable row level security;
alter table public.flags enable row level security;

-- Handy for the impact write-up: average score by attempt number per student.
create or replace view public.improvement_by_attempt
with (security_invoker = true) as
select attempt_no,
       count(*)                                         as students,
       round(avg(100.0 * score / nullif(max_score,0)),1) as avg_percent
from (
  select coalesce(user_id::text, anon_id) as student_id,
         score, max_score,
         row_number() over (partition by coalesce(user_id::text, anon_id) order by created_at) as attempt_no
  from public.attempts
) t
group by attempt_no
order by attempt_no;
