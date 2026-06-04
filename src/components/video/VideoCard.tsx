import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Video } from '../../lib/types';

interface VideoCardProps {
  video: Video;
  showChannel?: boolean;
}

export default function VideoCard({ video, showChannel = true }: VideoCardProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  return (
    <Link to={`/watch/${video.id}`} className="group">
      <div className="relative aspect-video bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden">
        <img
          src={video.thumbnail_url}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        {video.duration > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
            {formatDuration(video.duration)}
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-3">
        {showChannel && video.profiles && (
          <Link
            to={`/channel/${video.user_id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={video.profiles.avatar_url}
              alt={video.profiles.channel_name}
              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
            />
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 text-sm leading-tight mb-1">
            {video.title}
          </h3>
          {showChannel && video.profiles && (
            <Link
              to={`/channel/${video.user_id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {video.profiles.channel_name}
            </Link>
          )}
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            <Eye className="w-4 h-4" />
            <span>{formatViews(video.views_count)} views</span>
            <span className="mx-1">•</span>
            <span>
              {formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
