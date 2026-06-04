/*
  # YouTube Clone Database Schema

  This migration creates the complete database schema for a YouTube clone application.

  ## Tables Created:

  1. **profiles** - User profiles/channels
     - id (uuid, primary key, references auth.users)
     - email (text, unique)
     - channel_name (text, unique)
     - avatar_url (text)
     - banner_url (text)
     - bio (text)
     - created_at (timestamp)

  2. **videos** - Video content
     - id (uuid, primary key)
     - user_id (uuid, foreign key to profiles)
     - video_url (text)
     - thumbnail_url (text)
     - title (text)
     - description (text)
     - tags (text array)
     - category (text)
     - duration (integer, in seconds)
     - views_count (bigint)
     - visibility (text: 'public' or 'private')
     - created_at (timestamp)

  3. **comments** - Video comments
     - id (uuid, primary key)
     - video_id (uuid, foreign key to videos)
     - user_id (uuid, foreign key to profiles)
     - text (text)
     - created_at (timestamp)

  4. **likes** - Video likes/dislikes
     - id (uuid, primary key)
     - video_id (uuid, foreign key to videos)
     - user_id (uuid, foreign key to profiles)
     - type (text: 'like' or 'dislike')
     - created_at (timestamp)

  5. **subscriptions** - Channel subscriptions
     - id (uuid, primary key)
     - subscriber_id (uuid, foreign key to profiles)
     - channel_id (uuid, foreign key to profiles)
     - created_at (timestamp)

  ## Security:
  - Row Level Security (RLS) enabled on all tables
  - Policies ensure users can only access/modify their own data
  - Public content (public videos) is readable by all
  - Private content is only accessible by owners

  ## Notes:
  - Unique constraints prevent duplicate likes and subscriptions
  - Cascade deletes ensure data integrity when profiles or videos are deleted
  - Indexes added for frequently queried columns
*/

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  channel_name text UNIQUE NOT NULL,
  avatar_url text DEFAULT 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150',
  banner_url text DEFAULT 'https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&w=1200',
  bio text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  video_url text NOT NULL,
  thumbnail_url text DEFAULT 'https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg?auto=compress&cs=tinysrgb&w=640',
  title text NOT NULL,
  description text DEFAULT '',
  tags text[] DEFAULT '{}',
  category text DEFAULT 'Entertainment',
  duration integer DEFAULT 0,
  views_count bigint DEFAULT 0,
  visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  created_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('like', 'dislike')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(video_id, user_id)
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  channel_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(subscriber_id, channel_id),
  CHECK (subscriber_id != channel_id)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Videos policies
CREATE POLICY "Public videos are viewable by everyone"
  ON videos FOR SELECT
  TO authenticated
  USING (visibility = 'public' OR user_id = auth.uid());

CREATE POLICY "Users can insert own videos"
  ON videos FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own videos"
  ON videos FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own videos"
  ON videos FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Comments policies
CREATE POLICY "Comments on public videos are viewable by everyone"
  ON comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = comments.video_id
      AND (videos.visibility = 'public' OR videos.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert comments on public videos"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = comments.video_id
      AND (videos.visibility = 'public' OR videos.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Likes on public videos are viewable by everyone"
  ON likes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = likes.video_id
      AND (videos.visibility = 'public' OR videos.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert likes on public videos"
  ON likes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = likes.video_id
      AND (videos.visibility = 'public' OR videos.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete own likes"
  ON likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Subscriptions are viewable by everyone"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = subscriber_id);

CREATE POLICY "Users can delete own subscriptions"
  ON subscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = subscriber_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_visibility ON videos(visibility);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_video_id ON comments(video_id);
CREATE INDEX IF NOT EXISTS idx_likes_video_id ON likes(video_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscriber_id ON subscriptions(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_channel_id ON subscriptions(channel_id);

-- Function to automatically create a profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, channel_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'channel_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();