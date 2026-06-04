/*
  # Fix Storage Bucket Listing Policies

  Remove broad SELECT policies from public storage buckets that allow listing all objects.
  Public buckets still work with direct URLs - they just won't allow listing all files.

  Security Impact:
  - Users can still access videos/avatars/banners via direct public URLs
  - Users cannot enumerate/list all files in a bucket anymore
  - Prevents exposure of potentially sensitive file structure
*/

-- Remove overly permissive SELECT policies on storage.objects
DO $$
BEGIN
  -- Drop policies from avatars bucket if they exist
  DROP POLICY IF EXISTS "avatars-allow-public-read" ON storage.objects;
  DROP POLICY IF EXISTS "Public avatars read" ON storage.objects;
  
  -- Drop policies from banners bucket if they exist  
  DROP POLICY IF EXISTS "banners-allow-public-read" ON storage.objects;
  DROP POLICY IF EXISTS "Public banners read" ON storage.objects;
  
  -- Drop policies from videos bucket if they exist
  DROP POLICY IF EXISTS "videos-allow-public-read" ON storage.objects;
  DROP POLICY IF EXISTS "Public videos read" ON storage.objects;
  
  -- Generic ones that might exist
  DROP POLICY IF EXISTS "Public access" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can view banners" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can view videos" ON storage.objects;
  
  EXCEPTION WHEN OTHERS THEN NULL;
END $$;
