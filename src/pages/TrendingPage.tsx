import { useEffect, useState } from 'react';
import { Flame, TrendingUp, Music, Film, Gamepad2, Newspaper } from 'lucide-react';
import { supabase } from '../lib/supabase';
import VideoGrid from '../components/video/VideoGrid';

const categories = [
  { id: 'all', label: 'All', icon: Flame },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'movies', label: 'Movies', icon: Film },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { id: 'news', label: 'News', icon: Newspaper },
];

export default function TrendingPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchTrendingVideos();
  }, [activeCategory]);

  const fetchTrendingVideos = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('videos')
        .select(`
          *,
          profiles:user_id (channel_name, avatar_url)
        `)
        .eq('visibility', 'public')
        .order('views_count', { ascending: false })
        .limit(20);

      if (activeCategory !== 'all') {
        query = query.contains('tags', [activeCategory]);
      }

      const { data, error } = await query;

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching trending videos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-14 pl-[72px]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Flame className="w-8 h-8 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trending</h1>
        </div>

        {/* Categories */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                activeCategory === category.id
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <category.icon className="w-4 h-4" />
              <span className="font-medium">{category.label}</span>
            </button>
          ))}
        </div>

        {/* Trending info */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6 mb-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-6 h-6" />
            <h2 className="text-xl font-bold">Trending on YOUSHOW</h2>
          </div>
          <p className="text-sm opacity-90">
            Discover what's trending now. The most popular videos across YOUSHOW right now.
          </p>
        </div>

        {/* Videos Grid */}
        <VideoGrid videos={videos} loading={loading} />
      </div>
    </div>
  );
}
