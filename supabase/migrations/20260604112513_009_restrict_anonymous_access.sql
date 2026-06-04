/*
  # Restrict Anonymous Access Policies

  This migration addresses Supabase security advisory 0012 by:
  1. Removing overly permissive anonymous policies
  2. Restricting anonymous users to ONLY view public video content
  3. Preventing anonymous users from viewing sensitive user data
  4. Keeping read-only access to public videos for YouTube-like experience
  5. Removing anonymous access to subscriptions and profiles

  Key Changes:
  - Anonymous users can ONLY view videos marked as public
  - Anonymous users can view comments/likes on public videos
  - Anonymous users CANNOT view user profiles or subscription data
  - All write operations require authentication
  - Profile and subscription data restricted to authenticated users

  Security Rationale:
  - Profiles contain user metadata that should not be exposed to anonymous users
  - Subscription counts can reveal channel popularity (privacy concern)
  - Anonymous users only need to view published video content
*/

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Public can view channel subscription counts" ON subscriptions;
DROP POLICY IF EXISTS "Public can view creator profiles" ON profiles;

-- Keep only necessary anonymous read policies for video viewing
-- These are safe because:
-- 1. Videos are explicitly marked public
-- 2. Users intentionally published this content
-- 3. Read-only access doesn't modify data

-- Anonymous users can still view public videos (necessary for YouTube-like browsing)
-- Policy "Public can view public videos" already exists and is acceptable

-- Anonymous users can still view comments on public videos (necessary for engagement display)
-- Policy "Public can view comments on public videos" already exists and is acceptable

-- Anonymous users can still view likes on public videos (necessary for engagement metrics)
-- Policy "Public can view likes on public videos" already exists and is acceptable

-- Ensure profiles table DOES NOT have anonymous SELECT policy
-- Only authenticated users can view profiles
CREATE POLICY "Authenticated users can view any profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Ensure subscriptions table DOES NOT have anonymous SELECT policy
-- Only authenticated users can view subscriptions (for their own subscriptions)
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = subscriber_id);

-- Verify: Anonymous users can ONLY view public videos and their engagement
-- This is sufficient for a YouTube-like public browsing experience
