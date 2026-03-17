-- Bible Study Companion — Phase 2: Interactive Features
-- Run this in your Supabase SQL Editor

-- Prayer board
create table bible_prayers (
  id uuid primary key default gen_random_uuid(),
  user_name text not null,
  content text not null,
  is_answered boolean default false,
  partner_praying boolean default false,
  created_at timestamptz default now(),
  answered_at timestamptz
);

-- Daily gratitude (one per user per chapter, write-then-reveal)
create table bible_gratitude (
  id uuid primary key default gen_random_uuid(),
  user_name text not null,
  book text not null,
  chapter integer not null,
  content text not null,
  created_at timestamptz default now(),
  unique(user_name, book, chapter)
);

-- Shared verse highlights with notes
create table bible_highlights (
  id uuid primary key default gen_random_uuid(),
  user_name text not null,
  book text not null,
  chapter integer not null,
  verse integer not null,
  verse_text text not null,
  note text,
  created_at timestamptz default now(),
  unique(user_name, book, chapter, verse)
);

-- RLS policies (open access for 2-person private app)
alter table bible_prayers enable row level security;
alter table bible_gratitude enable row level security;
alter table bible_highlights enable row level security;

create policy "open_access" on bible_prayers for all using (true) with check (true);
create policy "open_access" on bible_gratitude for all using (true) with check (true);
create policy "open_access" on bible_highlights for all using (true) with check (true);
