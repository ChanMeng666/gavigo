-- Migration: Unified Content Social System (Videos + Games)
-- Allows social features (likes, comments, view_history) to work with both videos and games.
-- Games are stored in the videos table with content_type='game' and slug for dedup.

-- 1. Add content_type + slug to videos table
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS content_type text NOT NULL DEFAULT 'video';
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.videos ALTER COLUMN pexels_id DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_videos_slug ON public.videos(slug) WHERE slug IS NOT NULL;

-- 2. Rename video_id → content_id in social tables
ALTER TABLE public.likes RENAME COLUMN video_id TO content_id;
ALTER TABLE public.comments RENAME COLUMN video_id TO content_id;
ALTER TABLE public.view_history RENAME COLUMN video_id TO content_id;

-- 3. Recreate triggers (they reference the old column name)
CREATE OR REPLACE FUNCTION public.handle_like_change() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.videos SET like_count = like_count + 1 WHERE id = NEW.content_id;
    UPDATE public.profiles SET likes_count = likes_count + 1 WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.videos SET like_count = greatest(like_count - 1, 0) WHERE id = OLD.content_id;
    UPDATE public.profiles SET likes_count = greatest(likes_count - 1, 0) WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_comment_change() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.videos SET comment_count = comment_count + 1 WHERE id = NEW.content_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.videos SET comment_count = greatest(comment_count - 1, 0) WHERE id = OLD.content_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update RLS policies that reference video_id (if any exist)
-- Note: Postgres auto-renames the column in existing indexes, but check RLS policies manually.
