import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Video } from '../lib/types';
import VideoGrid from '../components/video/VideoGrid';
import { Search, Filter, TrendingUp, Clock } from 'lucide-react';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'views'>('relevance');

  useEffect(() => {
    if (query) {
      searchVideos();
    }
  }, [query, sortBy]);

  async function searchVideos() {
    setLoading(true);
    try {
      let queryBuilder = supabase
        .from('videos')
        .select('*, profiles!videos_user_id_fkey(*)')
        .eq('visibility', 'public')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{"${query}"}`);

      // Apply sorting
      if (sortBy === 'date') {
        queryBuilder = queryBuilder.order('created_at', { ascending: false });
      } else if (sortBy === 'views') {
        queryBuilder = queryBuilder.order('views_count', { ascending: false });
      } else {
        // Relevance - prioritize title matches
        queryBuilder = queryBuilder.order('created_at', { ascending: false });
      }

      const { data, error } = await queryBuilder.limit(50);

      if (error) throw error;

      // Sort by relevance if needed
      let results = data || [];
      if (sortBy === 'relevance' && results.length > 0) {
        results = results.sort((a, b) => {
          const aTitleMatch = a.title.toLowerCase().includes(query.toLowerCase());
          const bTitleMatch = b.title.toLowerCase().includes(query.toLowerCase());
          if (aTitleMatch && !bTitleMatch) return -1;
          if (!aTitleMatch && bTitleMatch) return 1;
          return 0;
        });
      }

      setVideos(results);
    } catch (error) {
      console.error('Error searching videos:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-900 dark:text-white mb-1">
            {loading ? (
              'Searching...'
            ) : (
              <>
                Search results for{' '}
                <span className="font-semibold text-blue-600 dark:text-blue-400">"{query}"</span>
              </>
            )}
          </h1>
          {!loading && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {videos.length} {videos.length === 1 ? 'result' : 'results'} found
            </p>
          )}
        </div>

        {/* Sort options */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-blue-500"
          >
            <option value="relevance">Relevance</option>
            <option value="date">Upload date</option>
            <option value="views">View count</option>
          </select>
        </div>
      </div>

      <VideoGrid videos={videos} loading={loading} />
    </div>
  );
}
