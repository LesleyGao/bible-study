-- Bible Study Companion — Supabase Setup
-- Run this in your Supabase SQL Editor (supabase.com → project → SQL Editor)

-- Reading progress for each user
create table bible_progress (
  id uuid primary key default gen_random_uuid(),
  user_name text not null,
  book text not null,
  chapter integer not null,
  read_at timestamptz default now(),
  unique(user_name, book, chapter)
);

-- Stored reflection prompts (one per chapter, shared between users)
create table bible_reflection_prompts (
  id uuid primary key default gen_random_uuid(),
  book text not null,
  chapter integer not null,
  prompt text not null,
  created_at timestamptz default now(),
  unique(book, chapter)
);

-- User reflections (one per user per chapter)
create table bible_reflections (
  id uuid primary key default gen_random_uuid(),
  user_name text not null,
  book text not null,
  chapter integer not null,
  content text not null,
  created_at timestamptz default now(),
  unique(user_name, book, chapter)
);

-- Bookmarked verses
create table bible_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_name text not null,
  book text not null,
  chapter integer not null,
  verse integer not null,
  verse_text text not null,
  created_at timestamptz default now(),
  unique(user_name, book, chapter, verse)
);

-- Open RLS policies (private app, 2 users, no auth needed)
alter table bible_progress enable row level security;
alter table bible_reflection_prompts enable row level security;
alter table bible_reflections enable row level security;
alter table bible_bookmarks enable row level security;

create policy "open_access" on bible_progress for all using (true) with check (true);
create policy "open_access" on bible_reflection_prompts for all using (true) with check (true);
create policy "open_access" on bible_reflections for all using (true) with check (true);
create policy "open_access" on bible_bookmarks for all using (true) with check (true);
