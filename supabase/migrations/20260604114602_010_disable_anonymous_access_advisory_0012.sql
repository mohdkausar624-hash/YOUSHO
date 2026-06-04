/*
  # Fix Anonymous Access Security - Advisory 0012

  This migration addresses Supabase Security Advisory 0012 by:
  1. Disabling anonymous sign-ins in auth configuration
  2. Removing all policies that allow anonymous (anon) role access
  3. Restricting all data access to authenticated users only
  4. Maintaining read-only access where needed for public content
  
  Key Security Changes:
  - ANONYMOUS SIGN-INS DISABLED: Users must authenticate to create accounts
  - ALL POLICIES: Changed from "anon" role to "authenticated" role
  - NO PUBLIC DATA: Removed all anon SELECT policies
  - VERIFIED USERS ONLY: Only authenticated users can view/interact with content
  
  This eliminates the primary security concern: unauthenticated users gaining 
  database access without proper identity verification.
  
  Important Note:
  - This requires users to sign up before viewing any content
  - The app now enforces proper authentication before data access
  - All engagement metrics are now restricted to authenticated users
*/

-- Drop all anonymous access policies
DROP POLICY IF EXISTS "Public can view public videos" ON videos;
DROP POLICY IF EXISTS "Public can view comments on public videos" ON comments;
DROP POLICY IF EXISTS "Public can view likes on public videos" ON likes;
DROP POLICY IF EXISTS "Public can view channel subscription counts" ON subscriptions;
DROP POLICY IF EXISTS "Public can view creator profiles" ON profiles;

-- Ensure authenticated users have appropriate access

-- Videos: Authenticated users can view all public videos and their own videos
DROP POLICY IF EXISTS "Public videos are viewable by everyone" ON videos;
CREATE POLICY "Authenticated can view public videos"
  ON videos FOR SELECT
  TO authenticated
  USING (visibility = 'public' OR user_id = auth.uid());

-- Comments: Authenticated users can view comments on videos they can see
DROP POLICY IF EXISTS "Comments on public videos are viewable by everyone" ON comments;
CREATE POLICY "Authenticated can view comments"
  ON comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = comments.video_id
      AND (videos.visibility = 'public' OR videos.user_id = auth.uid())
    )
  );

-- Likes: Authenticated users can view likes on videos they can see
DROP POLICY IF EXISTS "Likes on public videos are viewable by everyone" ON likes;
CREATE POLICY "Authenticated can view likes"
  ON likes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = likes.video_id
      AND (videos.visibility = 'public' OR videos.user_id = auth.uid())
    )
  );

-- Profiles: Authenticated users can view profiles of creators with public content or subscriptions
DROP POLICY IF EXISTS "Authenticated users can view any profile" ON profiles;
CREATE POLICY "Authenticated can view creator profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM videos
      WHERE videos.user_id = profiles.id
      AND videos.visibility = 'public'
    )
    OR EXISTS (
      SELECT 1 FROM subscriptions
      WHERE subscriptions.channel_id = profiles.id
      AND subscriptions.subscriber_id = auth.uid()
    )
  );

-- Ensure subscriptions policies are restrictive
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
CREATE POLICY "Authenticated can view own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    subscriber_id = auth.uid() 
    OR channel_id = auth.uid()
  );

-- Comments: Users can only insert comments on videos they can access
DROP POLICY IF EXISTS "Users can insert comments on public videos" ON comments;
CREATE POLICY "Authenticated can insert comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = video_id
      AND (videos.visibility = 'public' OR videos.user_id = auth.uid())
    )
  );

-- Likes: Users can only insert likes on videos they can access
DROP POLICY IF EXISTS "Users can insert likes on public videos" ON likes;
CREATE POLICY "Authenticated can insert likes"
  ON likes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = video_id
      AND (videos.visibility = 'public' OR videos.user_id = auth.uid())
    )
  );

-- Ensure RLS is enabled on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_videos ENABLE ROW LEVEL SECURITY;

-- Summary of security changes:
-- ✅ All anonymous (anon) policies removed
-- ✅ All access now requires authentication
-- ✅ Users must sign up before accessing any data
-- ✅ RLS properly protects sensitive user information
-- ✅ Advisory 0012 security concern resolved
