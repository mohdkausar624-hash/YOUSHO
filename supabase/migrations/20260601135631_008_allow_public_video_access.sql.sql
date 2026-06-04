/*
  # Allow Public Access to Videos

  Update RLS policies to allow unauthenticated (anon) users to:
  1. View all public videos
  2. View comments on public videos
  3. View likes on public videos
  4. View profiles of content creators
  5. View subscriptions (for channel info)

  This enables YouTube-like public access where anyone can browse
  videos without creating an account.
*/

-- 1. Add policy for anonymous users to view public videos
CREATE POLICY "Public can view public videos"
  ON videos FOR SELECT
  TO anon
  USING (visibility = 'public');

-- 2. Add policy for anonymous users to view comments on public videos
CREATE POLICY "Public can view comments on public videos"
  ON comments FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = comments.video_id
      AND videos.visibility = 'public'
    )
  );

-- 3. Add policy for anonymous users to view likes on public videos
CREATE POLICY "Public can view likes on public videos"
  ON likes FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = likes.video_id
      AND videos.visibility = 'public'
    )
  );

-- 4. Add policy for anonymous users to view creator profiles
CREATE POLICY "Public can view creator profiles"
  ON profiles FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM videos
      WHERE videos.user_id = profiles.id
      AND videos.visibility = 'public'
      LIMIT 1
    )
  );

-- 5. Add policy for anonymous users to view subscriptions (channel info)
CREATE POLICY "Public can view channel subscription counts"
  ON subscriptions FOR SELECT
  TO anon
  USING (true);

-- Also allow authenticated users to insert comments/likes on public videos (keep existing)
-- These policies already exist so we don't need to recreate them
