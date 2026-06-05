-- ============================================================
-- VCAC DATABASE SETUP
-- Run this entire file in Supabase → SQL Editor → New Query
-- ============================================================

-- PROFILES TABLE (one per user)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  email text,
  bio text,
  avatar_url text,
  role text default 'member' check (role in ('member', 'pro', 'president')),
  created_at timestamp with time zone default timezone('utc', now())
);

-- PROJECTS TABLE
create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  category text default 'Other',
  demo_url text,
  source_url text,
  html_code text,
  thumbnail_url text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  featured boolean default false,
  likes integer default 0,
  runs integer default 0,
  created_at timestamp with time zone default timezone('utc', now())
);

-- COMMENTS TABLE
create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc', now())
);

-- ============================================================
-- ROW LEVEL SECURITY (who can see/edit what)
-- ============================================================

alter table profiles enable row level security;
alter table projects enable row level security;
alter table comments enable row level security;

-- PROFILES: anyone can read, only you can edit yours
create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- PROJECTS: approved ones are public, pending only visible to owner/president
create policy "Approved projects viewable by everyone"
  on projects for select using (
    status = 'approved' or
    auth.uid() = user_id or
    exists (select 1 from profiles where id = auth.uid() and role = 'president')
  );

create policy "Authenticated users can insert projects"
  on projects for insert with check (auth.uid() = user_id);

create policy "Owners and president can update projects"
  on projects for update using (
    auth.uid() = user_id or
    exists (select 1 from profiles where id = auth.uid() and role = 'president')
  );

create policy "Owners and president can delete projects"
  on projects for delete using (
    auth.uid() = user_id or
    exists (select 1 from profiles where id = auth.uid() and role = 'president')
  );

-- COMMENTS: public read, authenticated write
create policy "Comments viewable by everyone"
  on comments for select using (true);

create policy "Authenticated users can comment"
  on comments for insert with check (auth.uid() = user_id);

-- ============================================================
-- HELPER FUNCTION (for liking projects)
-- ============================================================

create or replace function increment_likes(project_id uuid)
returns void as $$
  update projects set likes = likes + 1 where id = project_id;
$$ language sql security definer;

-- ============================================================
-- SET YOUR ACCOUNT AS PRESIDENT
-- Replace YOUR_EMAIL with the email you signed up with
-- ============================================================

-- UPDATE profiles SET role = 'president' WHERE email = 'YOUR_EMAIL@gmail.com';

-- ============================================================
-- DONE! Your database is ready.
-- ============================================================
