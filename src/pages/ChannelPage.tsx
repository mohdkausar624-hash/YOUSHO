import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Profile, Video } from '../lib/types';
import VideoGrid from '../components/video/VideoGrid';

export default function ChannelPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [channel, setChannel] = useState<Profile | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'videos' | 'about'>('videos');

  useEffect(() => {
    if (id) {
      fetchChannel();
      fetchVideos();
      fetchSubscriberCount();
      if (user) checkSubscription();
    }
  }, [id, user]);

  async function fetchChannel() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      setChannel(data);
    } catch (error) {
      console.error('Error fetching channel:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchVideos() {
    try {
      const query = supabase
        .from('videos')
        .select('*, profiles!videos_user_id_fkey(*)')
        .eq('user_id', id)
        .order('created_at', { ascending: false });

      if (user?.id !== id) {
        query.eq('visibility', 'public');
      }

      const { data, error } = await query;

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  }

  async function fetchSubscriberCount() {
    try {
      const { count, error } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('channel_id', id);

      if (error) throw error;
      setSubscriberCount(count || 0);
    } catch (error) {
      console.error('Error fetching subscriber count:', error);
    }
  }

  async function checkSubscription() {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('subscriber_id', user?.id)
        .eq('channel_id', id)
        .maybeSingle();

      if (error) throw error;
      setIsSubscribed(!!data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  }

  async function handleSubscribe() {
    if (!user || !id) return;

    try {
      if (isSubscribed) {
        await supabase
          .from('subscriptions')
          .delete()
          .eq('subscriber_id', user.id)
          .eq('channel_id', id);
        setIsSubscribed(false);
        setSubscriberCount(prev => prev - 1);
      } else {
        await supabase.from('subscriptions').insert({
          subscriber_id: user.id,
          channel_id: id,
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
      <div className="animate-pulse">
        <div className="h-40 bg-gray-200 dark:bg-gray-800" />
        <div className="p-6">
          <div className="w-32 h-32 bg-gray-200 dark:bg-gray-800 rounded-full -mt-20 mb-4" />
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="p-6">
        <p className="text-gray-600 dark:text-gray-400">Channel not found</p>
      </div>
    );
  }

  const isOwnChannel = user?.id === id;

  return (
    <div>
      <div className="relative h-40 sm:h-48 bg-gray-200 dark:bg-gray-800 overflow-hidden">
        <img
          src={channel.banner_url}
          alt={`${channel.channel_name} banner`}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-start gap-4 -mt-12 sm:-mt-14 mb-6">
          <img
            src={channel.avatar_url}
            alt={channel.channel_name}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-gray-900 object-cover"
          />
          <div className="pt-14 sm:pt-20 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {channel.channel_name}
            </h1>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
              <span>{subscriberCount} subscribers</span>
              <span>•</span>
              <span>{videos.length} videos</span>
            </div>
          </div>
          {user && !isOwnChannel && (
            <button
              onClick={handleSubscribe}
              className={`mt-14 sm:mt-20 px-6 py-2.5 rounded-full font-medium transition-colors ${
                isSubscribed
                  ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700'
                  : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
              }`}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          )}
        </div>

        <div className="border-b border-gray-200 dark:border-gray-800 mb-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('videos')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'videos'
                  ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Videos
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'about'
                  ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              About
            </button>
          </div>
        </div>

        {activeTab === 'videos' ? (
          <VideoGrid videos={videos} loading={false} />
        ) : (
          <div className="max-w-2xl">
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {channel.bio || 'No description yet.'}
            </p>
            <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
              <p>
                Joined {formatDistanceToNow(new Date(channel.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
