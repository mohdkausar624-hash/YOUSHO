/*
  # Add increment_views function

  This migration creates a PostgreSQL function to atomically increment video view counts.

  ## Function:
  - increment_views(video_id uuid): Increments the views_count for a video by 1

  ## Notes:
  - Uses atomic operation to prevent race conditions
  - Called when a video starts playing
*/

CREATE OR REPLACE FUNCTION increment_views(video_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE videos
  SET views_count = views_count + 1
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;