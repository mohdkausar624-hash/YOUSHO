import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Share, Save, MoreHorizontal, Eye } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { VideoWithDetails } from '../lib/types';
import VideoPlayer from '../components/video/VideoPlayer';
import VideoCard from '../components/video/VideoCard';
import CommentSection from '../components/comments/CommentSection';

export default function WatchPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [video, setVideo] = useState<VideoWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedVideos, setRelatedVideos] = useState<VideoWithDetails[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);

  useEffect(() => {
    if (id) {
      fetchVideo();
      incrementViews();
    }
  }, [id]);

  useEffect(() => {
    if (video && user) {
      checkSubscription();
      fetchUserLike();
    }
  }, [video, user]);

  async function fetchVideo() {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*, profiles!videos_user_id_fkey(*)')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      setVideo(data);

      if (data) {
        fetchRelatedVideos(data.category, data.id);
        fetchSubscriberCount(data.user_id);
      }
    } catch (error) {
      console.error('Error fetching video:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRelatedVideos(category: string, currentId: string) {
    try {
      // First try to get videos from same category
      const { data: categoryVideos, error: categoryError } = await supabase
        .from('videos')
        .select('*, profiles!videos_user_id_fkey(*)')
        .eq('visibility', 'public')
        .eq('category', category)
        .neq('id', currentId)
        .order('views_count', { ascending: false })
        .limit(10);

      if (categoryError) throw categoryError;

      // If we have enough category videos, use them
      if (categoryVideos && categoryVideos.length >= 5) {
        setRelatedVideos(categoryVideos);
      } else {
        // Otherwise, get general trending videos
        const { data: trendingVideos, error: trendingError } = await supabase
          .from('videos')
          .select('*, profiles!videos_user_id_fkey(*)')
          .eq('visibility', 'public')
          .neq('id', currentId)
          .order('views_count', { ascending: false })
          .limit(10);

        if (trendingError) throw trendingError;

        // Combine and deduplicate
        const combined = [...(categoryVideos || []), ...(trendingVideos || [])];
        const unique = combined.filter((video, index, self) =>
          index === self.findIndex(v => v.id === video.id)
        );
        setRelatedVideos(unique.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching related videos:', error);
    }
  }

  async function incrementViews() {
    try {
      await supabase.rpc('increment_views', { video_id: id });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  }

  async function fetchSubscriberCount(channelId: string) {
    try {
      const { count, error } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('channel_id', channelId);

      if (error) throw error;
      setSubscriberCount(count || 0);
    } catch (error) {
      console.error('Error fetching subscriber count:', error);
    }
  }

  async function checkSubscription() {
    if (!user || !video) return;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('subscriber_id', user.id)
        .eq('channel_id', video.user_id)
        .maybeSingle();

      if (error) throw error;
      setIsSubscribed(!!data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  }

  async function fetchUserLike() {
    if (!user || !video) return;

    try {
      const { data, error } = await supabase
        .from('likes')
        .select('type')
        .eq('video_id', video.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setVideo(prev => prev ? { ...prev, user_like: data?.type || null } : prev);
    } catch (error) {
      console.error('Error fetching user like:', error);
    }
  }

  async function handleLike() {
    if (!user || !video) return;

    try {
      if (video.user_like === 'like') {
        await supabase
          .from('likes')
          .delete()
          .eq('video_id', video.id)
          .eq('user_id', user.id);
        setVideo(prev => prev ? { ...prev, user_like: null } : prev);
      } else {
        if (video.user_like === 'dislike') {
          await supabase
            .from('likes')
            .delete()
            .eq('video_id', video.id)
            .eq('user_id', user.id);
        }
        await supabase.from('likes').insert({
          video_id: video.id,
          user_id: user.id,
          type: 'like',
        });
        setVideo(prev => prev ? { ...prev, user_like: 'like' } : prev);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  }

  async function handleDislike() {
    if (!user || !video) return;

    try {
      if (video.user_like === 'dislike') {
        await supabase
          .from('likes')
          .delete()
          .eq('video_id', video.id)
          .eq('user_id', user.id);
        setVideo(prev => prev ? { ...prev, user_like: null } : prev);
      } else {
        if (video.user_like === 'like') {
          await supabase
            .from('likes')
            .delete()
            .eq('video_id', video.id)
            .eq('user_id', user.id);
        }
        await supabase.from('likes').insert({
          video_id: video.id,
          user_id: user.id,
          type: 'dislike',
        });
        setVideo(prev => prev ? { ...prev, user_like: 'dislike' } : prev);
      }
    } catch (error) {
      console.error('Error toggling dislike:', error);
    }
  }

  async function handleSubscribe() {
    if (!user || !video) return;

    try {
      if (isSubscribed) {
        await supabase
          .from('subscriptions')
          .delete()
          .eq('subscriber_id', user.id)
          .eq('channel_id', video.user_id);
        setIsSubscribed(false);
        setSubscriberCount(prev => prev - 1);
      } else {
        await supabase.from('subscriptions').insert({
          subscriber_id: user.id,
          channel_id: video.user_id,
        });
        setIsSubscribed(true);
        setSubscriberCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling subscription:', error);
    }
  }

  if (loading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-xl" />
        <div className="mt-4 h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
        <div className="mt-2 h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="p-6">
        <p className="text-gray-600 dark:text-gray-400">Video not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6">
      <div className="flex-1">
        <VideoPlayer src={video.video_url} />

        <div className="mt-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {video.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                to={`/channel/${video.user_id}`}
                className="flex items-center gap-3"
              >
                <img
                  src={video.profiles?.avatar_url}
                  alt={video.profiles?.channel_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {video.profiles?.channel_name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {subscriberCount} subscribers
                  </p>
                </div>
              </Link>
              {user && user.id !== video.user_id && (
                <button
                  onClick={handleSubscribe}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                    isSubscribed
                      ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700'
                      : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
                  }`}
                >
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1 px-4 py-2 rounded-l-full border-r border-gray-300 dark:border-gray-700 transition-colors ${
                    video.user_like === 'like'
                      ? 'text-blue-600'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <ThumbsUp className="w-5 h-5" fill={video.user_like === 'like' ? 'currentColor' : 'none'} />
                  <span className="text-sm font-medium">Like</span>
                </button>
                <button
                  onClick={handleDislike}
                  className={`flex items-center gap-1 px-4 py-2 rounded-r-full transition-colors ${
                    video.user_like === 'dislike'
                      ? 'text-blue-600'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <ThumbsDown className="w-5 h-5" fill={video.user_like === 'dislike' ? 'currentColor' : 'none'} />
                </button>
              </div>

              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Share className="w-5 h-5" />
                <span className="text-sm font-medium">Share</span>
              </button>

              <button className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
              <Eye className="w-4 h-4" />
              <span>{video.views_count} views</span>
              <span>•</span>
              <span>{format(new Date(video.created_at), 'MMM d, yyyy')}</span>
            </div>
            <p className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap">
              {video.description}
            </p>
          </div>

          <CommentSection videoId={video.id} />
        </div>
      </div>

      <div className="w-full lg:w-80 flex-shrink-0">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Related videos
        </h3>
        <div className="space-y-4">
          {relatedVideos.map((video) => (
            <VideoCard key={video.id} video={video} showChannel={true} />
          ))}
        </div>
      </div>
    </div>
  );
}
