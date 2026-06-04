import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Music, Film, Gamepad2, Newspaper, Trophy, Lightbulb, Shirt, Radio } from 'lucide-react';
import { supabase } from '../lib/supabase';
import VideoGrid from '../components/video/VideoGrid';

const categoryConfig: Record<string, { icon: any; title: string; description: string; gradient: string }> = {
  music: {
    icon: Music,
    title: 'Music',
    description: 'Discover the latest music videos and artists',
    gradient: 'from-green-500 to-teal-500',
  },
  movies: {
    icon: Film,
    title: 'Movies & TV',
    description: 'Watch trailers, clips, and behind-the-scenes content',
    gradient: 'from-purple-500 to-pink-500',
  },
  gaming: {
    icon: Gamepad2,
    title: 'Gaming',
    description: 'Live streams, walkthroughs, and gaming highlights',
    gradient: 'from-red-500 to-orange-500',
  },
  news: {
    icon: Newspaper,
    title: 'News',
    description: 'Breaking news and current events from around the world',
    gradient: 'from-blue-500 to-cyan-500',
  },
  sports: {
    icon: Trophy,
    title: 'Sports',
    description: 'Sports highlights, replays, and analysis',
    gradient: 'from-orange-500 to-red-500',
  },
  learning: {
    icon: Lightbulb,
    title: 'Learning',
    description: 'Educational content and tutorials',
    gradient: 'from-yellow-500 to-orange-500',
  },
  fashion: {
    icon: Shirt,
    title: 'Fashion & Beauty',
    description: 'Style tips, beauty tutorials, and fashion trends',
    gradient: 'from-pink-500 to-purple-500',
  },
  live: {
    icon: Radio,
    title: 'Live',
    description: 'Watch live streams and events',
    gradient: 'from-red-600 to-pink-600',
  },
};

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const config = categoryConfig[category || 'music'];

  useEffect(() => {
    fetchCategoryVideos();
  }, [category]);

  const fetchCategoryVideos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          profiles:user_id (channel_name, avatar_url)
        `)
        .eq('visibility', 'public')
        .eq('category', category?.charAt(0).toUpperCase() + category?.slice(1) || 'Entertainment')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching category videos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-14 pl-[72px]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Category Header */}
        <div className={`bg-gradient-to-r ${config.gradient} rounded-lg p-6 mb-6 text-white`}>
          <div className="flex items-center gap-3 mb-2">
            <config.icon className="w-8 h-8" />
            <h1 className="text-2xl font-bold">{config.title}</h1>
          </div>
          <p className="text-sm opacity-90">{config.description}</p>
        </div>

        {/* Videos Grid */}
        <VideoGrid videos={videos} loading={loading} />
      </div>
    </div>
  );
}
