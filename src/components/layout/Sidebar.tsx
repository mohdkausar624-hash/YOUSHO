import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  PlaySquare,
  Clock,
  ThumbsUp,
  User,
  History,
  Video,
  ChevronLeft,
  ChevronRight,
  Flame,
  Radio,
  Film,
  Music,
  Gamepad2,
  Trophy,
  Newspaper,
  Lightbulb,
  Shirt,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export default function Sidebar({ isOpen, isExpanded, onToggleExpand }: SidebarProps) {
  const { user, profile } = useAuth();
  const location = useLocation();

  const mainItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Sparkles, label: 'Shorts', path: '/shorts' },
    { icon: PlaySquare, label: 'Subscriptions', path: '/subscriptions', auth: true },
  ];

  const exploreItems = [
    { icon: Flame, label: 'Trending', path: '/trending' },
    { icon: Music, label: 'Music', path: '/music' },
    { icon: Film, label: 'Movies', path: '/movies' },
    { icon: Radio, label: 'Live', path: '/live' },
    { icon: Gamepad2, label: 'Gaming', path: '/gaming' },
    { icon: Newspaper, label: 'News', path: '/news' },
    { icon: Trophy, label: 'Sports', path: '/sports' },
    { icon: Lightbulb, label: 'Learning', path: '/learning' },
    { icon: Shirt, label: 'Fashion', path: '/fashion' },
  ];

  const libraryItems = [
    { icon: History, label: 'History', path: '/history', auth: true },
    { icon: Clock, label: 'Watch later', path: '/watch-later', auth: true },
    { icon: ThumbsUp, label: 'Liked videos', path: '/liked-videos', auth: true },
    { icon: Video, label: 'Your videos', path: '/your-videos', auth: true },
    { icon: PlaySquare, label: 'Your playlists', path: '/playlists', auth: true },
  ];

  const isActive = (path: string) => location.pathname === path;

  if (!isOpen) return null;

  return (
    <>
      <div
        className={`fixed left-0 top-14 h-[calc(100vh-3.5rem)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-40 overflow-y-auto ${
          isExpanded ? 'w-60' : 'w-[72px]'
        }`}
      >
        <div className="py-3">
          {mainItems.map((item) => {
            if (item.auth && !user) return null;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-6 px-3 py-2 mx-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-gray-200 dark:bg-gray-800'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                } ${!isExpanded ? 'justify-center' : ''}`}
              >
                <item.icon
                  className={`w-5 h-5 ${
                    isActive(item.path)
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                />
                {isExpanded && (
                  <span className="text-sm text-gray-900 dark:text-white">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="border-t border-gray-200 dark:border-gray-800 my-3 mx-3" />
          <div className="px-6 mb-2">
            {isExpanded && (
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Explore
              </h3>
            )}
          </div>
          {exploreItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-6 px-3 py-2 mx-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-gray-200 dark:bg-gray-800'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              } ${!isExpanded ? 'justify-center' : ''}`}
            >
              <item.icon
                className={`w-5 h-5 ${
                  isActive(item.path)
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              />
              {isExpanded && (
                <span className="text-sm text-gray-900 dark:text-white">
                  {item.label}
                </span>
              )}
            </Link>
          ))}

          {user && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-800 my-3 mx-3" />
              <div className="px-6 mb-2">
                {isExpanded && (
                  <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Library
                  </h3>
                )}
              </div>
              {libraryItems.map((item) => {
                if (item.auth && !user) return null;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-6 px-3 py-2 mx-3 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-gray-200 dark:bg-gray-800'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    } ${!isExpanded ? 'justify-center' : ''}`}
                  >
                    <item.icon
                      className={`w-5 h-5 ${
                        isActive(item.path)
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    />
                    {isExpanded && (
                      <span className="text-sm text-gray-900 dark:text-white">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}

              {profile && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-800 my-3 mx-3" />
                  <div className="px-6 mb-2">
                    {isExpanded && (
                      <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Subscriptions
                      </h3>
                    )}
                  </div>
                  <Link
                    to={`/channel/${profile.id}`}
                    className={`flex items-center gap-6 px-3 py-2 mx-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      !isExpanded ? 'justify-center' : ''
                    }`}
                  >
                    <img
                      src={profile.avatar_url}
                      alt={profile.channel_name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    {isExpanded && (
                      <span className="text-sm text-gray-900 dark:text-white truncate">
                        {profile.channel_name}
                      </span>
                    )}
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        <button
          onClick={onToggleExpand}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {isExpanded ? (
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>
    </>
  );
}
