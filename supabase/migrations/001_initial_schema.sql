-- GAVIGO IRE: Supabase Schema Migration
-- Run this in Supabase SQL Editor

-- ============================================================
-- 1. PROFILES (linked to auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar_url text,
  bio text default '',
  followers_count int default 0,
  following_count int default 0,
  likes_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 2. VIDEOS (curated from Pexels)
-- ============================================================
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  pexels_id bigint unique not null,
  title text not null,
  description text default '',
  theme text not null,
  video_url text not null,
  thumbnail_url text not null,
  duration int default 0,
  photographer text default '',
  photographer_url text default '',
  width int default 0,
  height int default 0,
  like_count int default 0,
  comment_count int default 0,
  view_count int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_videos_theme on public.videos(theme);
create index if not exists idx_videos_pexels_id on public.videos(pexels_id);
create index if not exists idx_videos_created_at on public.videos(created_at desc);
create index if not exists idx_videos_like_count on public.videos(like_count desc);

-- ============================================================
-- 3. LIKES
-- ============================================================
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, video_id)
);

create index if not exists idx_likes_video on public.likes(video_id);
create index if not exists idx_likes_user on public.likes(user_id);

-- ============================================================
-- 4. COMMENTS
-- ============================================================
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  text text not null check (char_length(text) <= 500),
  created_at timestamptz default now()
);

create index if not exists idx_comments_video on public.comments(video_id, created_at desc);

-- ============================================================
-- 5. FOLLOWS
-- ============================================================
create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(follower_id, following_id),
  check (follower_id != following_id)
);

create index if not exists idx_follows_follower on public.follows(follower_id);
create index if not exists idx_follows_following on public.follows(following_id);

-- ============================================================
-- 6. CHAT MESSAGES
-- ============================================================
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  conversation_id uuid not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

create index if not exists idx_chat_user_conv on public.chat_messages(user_id, conversation_id, created_at);

-- ============================================================
-- 7. VIEW HISTORY
-- ============================================================
create table if not exists public.view_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  watch_duration_ms int default 0,
  created_at timestamptz default now()
);

create index if not exists idx_view_history_user on public.view_history(user_id, created_at desc);

-- ============================================================
-- TRIGGERS: Atomic counter updates
-- ============================================================

-- Like counter on videos + profiles
create or replace function public.handle_like_change()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.videos set like_count = like_count + 1 where id = NEW.video_id;
    update public.profiles set likes_count = likes_count + 1 where id = NEW.user_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.videos set like_count = greatest(like_count - 1, 0) where id = OLD.video_id;
    update public.profiles set likes_count = greatest(likes_count - 1, 0) where id = OLD.user_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_like_change on public.likes;
create trigger on_like_change
  after insert or delete on public.likes
  for each row execute function public.handle_like_change();

-- Comment counter on videos
create or replace function public.handle_comment_change()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.videos set comment_count = comment_count + 1 where id = NEW.video_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.videos set comment_count = greatest(comment_count - 1, 0) where id = OLD.video_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_comment_change on public.comments;
create trigger on_comment_change
  after insert or delete on public.comments
  for each row execute function public.handle_comment_change();

-- Follow counters on profiles
create or replace function public.handle_follow_change()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.profiles set following_count = following_count + 1 where id = NEW.follower_id;
    update public.profiles set followers_count = followers_count + 1 where id = NEW.following_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.profiles set following_count = greatest(following_count - 1, 0) where id = OLD.follower_id;
    update public.profiles set followers_count = greatest(followers_count - 1, 0) where id = OLD.following_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_follow_change on public.follows;
create trigger on_follow_change
  after insert or delete on public.follows
  for each row execute function public.handle_follow_change();

-- Auto-create profile on auth.users insert
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    NEW.id,
    coalesce(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at trigger for profiles
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists on_profiles_updated on public.profiles;
create trigger on_profiles_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.videos enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;
alter table public.chat_messages enable row level security;
alter table public.view_history enable row level security;

-- Profiles: anyone reads, owner updates
create policy "Profiles are viewable by everyone" on public.profiles
  for select using (true);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Videos: anyone reads active videos, service role inserts
create policy "Active videos are viewable by everyone" on public.videos
  for select using (is_active = true);
create policy "Authenticated users can insert videos" on public.videos
  for insert with check (auth.role() = 'authenticated');

-- Likes: anyone reads, authenticated users manage own
create policy "Likes are viewable by everyone" on public.likes
  for select using (true);
create policy "Authenticated users can like" on public.likes
  for insert with check (auth.uid() = user_id);
create policy "Users can unlike own likes" on public.likes
  for delete using (auth.uid() = user_id);

-- Comments: anyone reads, authenticated users manage own
create policy "Comments are viewable by everyone" on public.comments
  for select using (true);
create policy "Authenticated users can comment" on public.comments
  for insert with check (auth.uid() = user_id);
create policy "Users can delete own comments" on public.comments
  for delete using (auth.uid() = user_id);

-- Follows: anyone reads, authenticated users manage own
create policy "Follows are viewable by everyone" on public.follows
  for select using (true);
create policy "Authenticated users can follow" on public.follows
  for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow" on public.follows
  for delete using (auth.uid() = follower_id);

-- Chat messages: only owner reads/writes
create policy "Users can read own chat messages" on public.chat_messages
  for select using (auth.uid() = user_id);
create policy "Users can insert own chat messages" on public.chat_messages
  for insert with check (auth.uid() = user_id);

-- View history: only owner reads/writes
create policy "Users can read own view history" on public.view_history
  for select using (auth.uid() = user_id);
create policy "Users can insert own view history" on public.view_history
  for insert with check (auth.uid() = user_id);

-- ============================================================
-- REALTIME: Enable on likes and comments
-- ============================================================
alter publication supabase_realtime add table public.likes;
alter publication supabase_realtime add table public.comments;
