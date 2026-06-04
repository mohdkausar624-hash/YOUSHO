import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Video } from '../lib/types';
import VideoGrid from '../components/video/VideoGrid';

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscribedVideos();
    }
  }, [user]);

  async function fetchSubscribedVideos() {
    try {
      const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select('channel_id')
        .eq('subscriber_id', user?.id);

      if (subError) throw subError;

      if (!subscriptions || subscriptions.length === 0) {
        setVideos([]);
        setLoading(false);
        return;
      }

      const channelIds = subscriptions.map((s) => s.channel_id);

      const { data, error } = await supabase
        .from('videos')
        .select('*, profiles!videos_user_id_fkey(*)')
        .in('user_id', channelIds)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching subscribed videos:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to see videos from channels you subscribe to.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-medium text-gray-900 dark:text-white mb-6">
        Subscriptions
      </h1>
      <VideoGrid videos={videos} loading={loading} />
    </div>
  );
}
