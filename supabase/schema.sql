-- Movie Your English: student-only progress storage
-- Run this in Supabase: SQL Editor > New query > Run.

create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_slug text not null check (char_length(lesson_slug) between 1 and 100),
  state jsonb not null default '{}'::jsonb,
  completed smallint not null default 0 check (completed >= 0),
  total smallint not null default 0 check (total >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_slug)
);

alter table public.lesson_progress enable row level security;

drop policy if exists "Students read only their own progress" on public.lesson_progress;
create policy "Students read only their own progress"
  on public.lesson_progress for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Students create only their own progress" on public.lesson_progress;
create policy "Students create only their own progress"
  on public.lesson_progress for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Students update only their own progress" on public.lesson_progress;
create policy "Students update only their own progress"
  on public.lesson_progress for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Students delete only their own progress" on public.lesson_progress;
create policy "Students delete only their own progress"
  on public.lesson_progress for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_lesson_progress_updated_at on public.lesson_progress;
create trigger set_lesson_progress_updated_at
before update on public.lesson_progress
for each row execute function public.set_updated_at();
