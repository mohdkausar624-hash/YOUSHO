/*
  # Add Playlists Feature

  1. New Tables
    - `playlists`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `title` (text, not null)
      - `description` (text)
      - `visibility` (text, public/private)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `playlist_videos`
      - `id` (uuid, primary key)
      - `playlist_id` (uuid, foreign key)
      - `video_id` (uuid, foreign key)
      - `position` (integer)
      - `added_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Users can manage their own playlists
    - Public playlists visible to all authenticated users
*/

CREATE TABLE IF NOT EXISTS playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  visibility text NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS playlist_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  added_at timestamptz DEFAULT now(),
  UNIQUE(playlist_id, video_id)
);

-- Enable RLS
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_videos ENABLE ROW LEVEL SECURITY;

-- Policies for playlists
CREATE POLICY "Users can view their own playlists"
  ON playlists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public playlists"
  ON playlists FOR SELECT
  TO authenticated
  USING (visibility = 'public');

CREATE POLICY "Users can create their own playlists"
  ON playlists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists"
  ON playlists FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists"
  ON playlists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for playlist_videos
CREATE POLICY "Users can view videos in their playlists"
  ON playlist_videos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_videos.playlist_id
      AND (playlists.user_id = auth.uid() OR playlists.visibility = 'public')
    )
  );

CREATE POLICY "Users can add videos to their playlists"
  ON playlist_videos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_videos.playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete videos from their playlists"
  ON playlist_videos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_videos.playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_playlists_user_id ON playlists(user_id);
CREATE INDEX idx_playlist_videos_playlist_id ON playlist_videos(playlist_id);
CREATE INDEX idx_playlist_videos_video_id ON playlist_videos(video_id);
