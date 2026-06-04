/*
  # Create Storage Buckets

  This migration creates the required storage buckets for the YouTube clone.

  ## Buckets Created:
  1. videos - For storing video files and thumbnails
  2. avatars - For storing user profile pictures
  3. banners - For storing channel banners

  ## Security:
  - Authenticated users can upload files
  - Public read access for all files
  - Users can only manage their own files
*/

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('videos', 'videos', true),
  ('avatars', 'avatars', true),
  ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for videos bucket
CREATE POLICY "Anyone can view videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'videos');

CREATE POLICY "Authenticated users can upload videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Users can update their own videos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own videos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy for avatars bucket
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy for banners bucket
CREATE POLICY "Anyone can view banners"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'banners');

CREATE POLICY "Authenticated users can upload banners"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'banners');

CREATE POLICY "Users can update their own banners"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own banners"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);