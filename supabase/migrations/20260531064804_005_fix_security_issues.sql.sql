/*
  # Fix Security Issues in RLS Policies

  This migration addresses critical security warnings:
  1. Profiles table: Restrict profile viewing to public profiles only
  2. Subscriptions table: Restrict subscription viewing to relevant users only

  ## Changes:
  - Remove unrestricted "true" policies
  - Add proper access control based on user ownership and relationships
  - Ensure users can only view data they should have access to

  ## Security Improvements:
  1. Profiles: Users can only view their own profile and public channels
  2. Subscriptions: Users can only view their own subscriptions and subscriber counts
*/

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Subscriptions are viewable by everyone" ON subscriptions;

-- Create new restrictive policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can view public profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
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

-- Create new restrictive policies for subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    auth.uid() = subscriber_id
    OR auth.uid() = channel_id
  );
