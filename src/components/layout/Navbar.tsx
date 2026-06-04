import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Upload, Menu, Bell, User, LogOut, Sun, Moon, Settings, Mic, Video, Grid3X3, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAppsDropdown, setShowAppsDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        if (transcript.trim()) {
          navigate(`/search?q=${encodeURIComponent(transcript.trim())}`);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert('Voice search is not supported in your browser');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </button>
        <Link to="/" className="flex items-center gap-1">
          <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-2 py-1 rounded-lg font-bold text-base tracking-tight shadow-lg">
            YOU
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg hidden sm:block">
            SHOW
          </span>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
        <div className="flex items-center">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-l-full focus:outline-none focus:border-blue-500 dark:text-white"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 border border-l-0 border-gray-300 dark:border-gray-700 rounded-r-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            type="button"
            onClick={handleVoiceSearch}
            className={`ml-3 p-2.5 rounded-full transition-colors ${
              isListening
                ? 'bg-red-100 dark:bg-red-900 animate-pulse'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            title="Search with your voice"
          >
            <Mic className={`w-5 h-5 ${isListening ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-300'}`} />
          </button>
        </div>
      </form>

      <div className="flex items-center gap-2">
        {user && (
          <>
            <Link
              to="/upload"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors hidden sm:block"
              title="Upload"
            >
              <Video className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            </Link>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            </button>
          </>
        )}

        <div className="relative">
          <button
            onClick={() => setShowAppsDropdown(!showAppsDropdown)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            title="YOUSHOW apps"
          >
            <Grid3X3 className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>

          {showAppsDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowAppsDropdown(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 p-4">
                <div className="grid grid-cols-3 gap-4">
                  <Link to="/shorts" onClick={() => setShowAppsDropdown(false)} className="flex flex-col items-center gap-2 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Video className="w-6 h-6 text-red-600" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">Shorts</span>
                  </Link>
                  <Link to="/trending" onClick={() => setShowAppsDropdown(false)} className="flex flex-col items-center gap-2 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Video className="w-6 h-6 text-orange-600" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">Trending</span>
                  </Link>
                  <Link to="/music" onClick={() => setShowAppsDropdown(false)} className="flex flex-col items-center gap-2 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Video className="w-6 h-6 text-green-600" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">Music</span>
                  </Link>
                  <Link to="/gaming" onClick={() => setShowAppsDropdown(false)} className="flex flex-col items-center gap-2 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Video className="w-6 h-6 text-purple-600" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">Gaming</span>
                  </Link>
                  <Link to="/live" onClick={() => setShowAppsDropdown(false)} className="flex flex-col items-center gap-2 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Video className="w-6 h-6 text-red-500" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">Live</span>
                  </Link>
                  <Link to="/news" onClick={() => setShowAppsDropdown(false)} className="flex flex-col items-center gap-2 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Video className="w-6 h-6 text-blue-600" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">News</span>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          ) : (
            <Moon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          )}
        </button>

        {user && profile ? (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <img
                src={profile.avatar_url}
                alt={profile.channel_name}
                className="w-8 h-8 rounded-full object-cover"
              />
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 py-2">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                    <img
                      src={profile.avatar_url}
                      alt={profile.channel_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {profile.channel_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {profile.email}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/channel/${profile.id}`}
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
                  >
                    <User className="w-5 h-5" />
                    <span>Your channel</span>
                  </Link>
                  <Link
                    to="/your-videos"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
                  >
                    <Video className="w-5 h-5" />
                    <span>Your videos</span>
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </Link>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link
            to="/signin"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <User className="w-4 h-4" />
            <span>Sign in</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
