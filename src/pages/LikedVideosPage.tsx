import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Video } from '../lib/types';
import VideoGrid from '../components/video/VideoGrid';

export default function LikedVideosPage() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLikedVideos();
    }
  }, [user]);

  async function fetchLikedVideos() {
    try {
      const { data: likes, error: likesError } = await supabase
        .from('likes')
        .select('video_id')
        .eq('user_id', user?.id)
        .eq('type', 'like');

      if (likesError) throw likesError;

      if (!likes || likes.length === 0) {
        setVideos([]);
        setLoading(false);
        return;
      }

      const videoIds = likes.map((l) => l.video_id);

      const { data, error } = await supabase
        .from('videos')
        .select('*, profiles!videos_user_id_fkey(*)')
        .in('id', videoIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching liked videos:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to see videos you liked.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-medium text-gray-900 dark:text-white mb-6">
        Liked videos
      </h1>
      <VideoGrid videos={videos} loading={loading} />
    </div>
  );
}
