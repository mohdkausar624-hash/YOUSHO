import VideoCard from './VideoCard';
import { Video } from '../../lib/types';

interface VideoGridProps {
  videos: Video[];
  loading?: boolean;
}

export default function VideoGrid({ videos, loading }: VideoGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-xl" />
            <div className="flex gap-3 mt-3">
              <div className="w-9 h-9 bg-gray-200 dark:bg-gray-800 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-1" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-lg text-gray-600 dark:text-gray-400">No videos found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
