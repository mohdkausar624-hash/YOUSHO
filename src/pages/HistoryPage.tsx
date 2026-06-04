import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Video } from '../lib/types';
import VideoGrid from '../components/video/VideoGrid';

export default function HistoryPage() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to see your watch history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-medium text-gray-900 dark:text-white mb-6">
        History
      </h1>
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          Watch history is not tracked yet. Start watching videos to build your history.
        </p>
      </div>
    </div>
  );
}
