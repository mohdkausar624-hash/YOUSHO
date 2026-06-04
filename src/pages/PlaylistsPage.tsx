import { useEffect, useState } from 'react';
import { Plus, Lock, Globe, MoreVertical, Trash2, Edit, Play } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Playlist {
  id: string;
  title: string;
  description: string;
  visibility: 'public' | 'private';
  created_at: string;
  videos: any[];
  video_count: number;
}

export default function PlaylistsPage() {
  const { user, profile } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [newPlaylistVisibility, setNewPlaylistVisibility] = useState<'public' | 'private'>('private');

  useEffect(() => {
    if (user) {
      fetchPlaylists();
    }
  }, [user]);

  const fetchPlaylists = async () => {
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const playlistsWithVideos = (data || []).map((playlist) => ({
        ...playlist,
        videos: [],
        video_count: 0,
      }));

      setPlaylists(playlistsWithVideos);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = async () => {
    if (!newPlaylistTitle.trim()) return;

    try {
      const { error } = await supabase.from('playlists').insert({
        user_id: user?.id,
        title: newPlaylistTitle.trim(),
        description: newPlaylistDescription.trim(),
        visibility: newPlaylistVisibility,
      });

      if (error) throw error;

      setShowCreateModal(false);
      setNewPlaylistTitle('');
      setNewPlaylistDescription('');
      setNewPlaylistVisibility('private');
      fetchPlaylists();
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;

    try {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId);

      if (error) throw error;
      fetchPlaylists();
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-14 pl-[72px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Sign in to view your playlists</p>
          <a
            href="/signin"
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            Sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-14 pl-[72px]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Playlists</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">New playlist</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[... Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 dark:bg-gray-700 rounded-lg aspect-video mb-3" />
                <div className="bg-gray-300 dark:bg-gray-700 h-4 rounded mb-2" />
                <div className="bg-gray-300 dark:bg-gray-700 h-3 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-12">
            <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">No playlists yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
              Create your first playlist to organize your favorite videos
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              Create playlist
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
                    <Play className="w-12 h-12" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {playlist.video_count} videos
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                  <div className="absolute absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                      <MoreVertical className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                  </div>
                </div>

                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
                        {playlist.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>{playlist.visibility === 'private' ? 'Private' : 'Public'}</span>
                        {playlist.visibility === 'private' && <Lock className="w-3 h-3" />}
                        {playlist.visibility === 'public' && <Globe className="w-3 h-3" />}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {playlist.description || 'No description'}
                      </p>
                    </div>

                    <div className="relative">
                      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <button
                          onClick={() => deletePlaylist(playlist.id)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete playlist</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Playlist Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Create playlist
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newPlaylistTitle}
                    onChange={(e) => setNewPlaylistTitle(e.target.value)}
                    placeholder="Enter playlist title"
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={newPlaylistDescription}
                    onChange={(e) => setNewPlaylistDescription(e.target.value)}
                    placeholder="Add a description"
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Privacy
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <input
                        type="radio"
                        name="visibility"
                        checked={newPlaylistVisibility === 'private'}
                        onChange={() => setNewPlaylistVisibility('private')}
                        className="text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">Private</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Only you can view this playlist
                        </p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <input
                        type="radio"
                        name="visibility"
                        checked={newPlaylistVisibility === 'public'}
                        onChange={() => setNewPlaylistVisibility('public')}
                        className="text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">Public</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Anyone can view this playlist
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createPlaylist}
                  disabled={!newPlaylistTitle.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
