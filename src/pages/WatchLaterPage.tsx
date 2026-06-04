import { useAuth } from '../contexts/AuthContext';

export default function WatchLaterPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to see your watch later list.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-medium text-gray-900 dark:text-white mb-6">
        Watch later
      </h1>
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          No videos saved for later. Add videos to watch later from the video options.
        </p>
      </div>
    </div>
  );
}
