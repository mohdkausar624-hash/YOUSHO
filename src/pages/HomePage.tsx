import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Video } from '../lib/types';
import VideoGrid from '../components/video/VideoGrid';
import { TrendingUp, Sparkles, Clock } from 'lucide-react';

export default function HomePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
  }, [activeFilter]);

  async function fetchVideos() {
    try {
      setLoading(true);
      setError(null);
      let query = supabase
        .from('videos')
        .select('*, profiles!videos_user_id_fkey(*)', { count: 'exact' })
        .eq('visibility', 'public');

      if (activeFilter === 'trending') {
        query = query.order('views_count', { ascending: false });
      } else if (activeFilter === 'recent') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError('Failed to load videos. Please try again.');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      {/* Filter tabs */}
      <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
            activeFilter === 'all'
              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          All
        </button>
        <button
          onClick={() => setActiveFilter('trending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
            activeFilter === 'trending'
              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Trending
        </button>
        <button
          onClick={() => setActiveFilter('recent')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
            activeFilter === 'recent'
              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          Recent
        </button>
      </div>

      <VideoGrid videos={videos} loading={loading} />
    </div>
  );
}
