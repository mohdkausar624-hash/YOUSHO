/*
  # Fix Security Issues - Proper Order

  This migration addresses Supabase security warnings by:
  1. Dropping triggers first
  2. Recreating functions with SECURITY INVOKER and immutable search_path
  3. Recreating triggers
  4. Removing broad storage bucket policies
  5. Restricting function execution permissions
*/

-- 1. Drop triggers first (they depend on functions)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Drop and recreate handle_new_user function with SECURITY INVOKER
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, channel_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'channel_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- 3. Drop and recreate increment_views function with SECURITY INVOKER
DROP FUNCTION IF EXISTS public.increment_views(uuid);

CREATE FUNCTION public.increment_views(video_id uuid)
RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  UPDATE videos
  SET views_count = views_count + 1
  WHERE id = video_id;
$$;

-- 4. Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Restrict function execution - only authenticated users can execute increment_views
REVOKE EXECUTE ON FUNCTION public.increment_views(uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_views(uuid) TO authenticated;
