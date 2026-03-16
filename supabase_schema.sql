-- ============================================================
-- AI Lecture Notes Organizer — Supabase Schema
-- Run in Supabase SQL Editor
-- ============================================================

-- Profiles (extends auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz default now()
);

-- Courses
create table courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  course_name text not null,
  color text default '#6366f1',   -- UI accent per course
  emoji text default '📚',
  created_at timestamptz default now()
);

-- Notes
create table notes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  file_url text,           -- Supabase Storage URL
  file_name text,
  file_type text,          -- 'pdf' | 'docx' | 'txt' | 'pptx'
  content text,            -- extracted raw text
  summary text,            -- AI-generated summary
  status text default 'pending', -- 'pending' | 'processing' | 'done' | 'error'
  created_at timestamptz default now()
);

-- Flashcards
create table flashcards (
  id uuid primary key default gen_random_uuid(),
  note_id uuid references notes(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  question text not null,
  answer text not null,
  created_at timestamptz default now()
);

-- ── RLS ──────────────────────────────────────────────────
alter table profiles   enable row level security;
alter table courses    enable row level security;
alter table notes      enable row level security;
alter table flashcards enable row level security;

create policy "own profile"     on profiles   for all using (auth.uid() = id);
create policy "own courses"     on courses    for all using (auth.uid() = user_id);
create policy "own notes"       on notes      for all using (auth.uid() = user_id);
create policy "own flashcards"  on flashcards for all using (auth.uid() = user_id);

-- ── Storage bucket ────────────────────────────────────────
-- Run in Supabase Dashboard → Storage → New Bucket: "notes"
-- Make bucket PRIVATE
-- Then add policy: authenticated users can upload/read their own files

-- ── Auto-create profile ───────────────────────────────────
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles(id, email, full_name)
  values (new.id, new.email, split_part(new.email,'@',1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
