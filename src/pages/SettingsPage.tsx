import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsPage() {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [channelName, setChannelName] = useState(profile?.channel_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatarFile(file);
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setBannerFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updates: Record<string, string> = {};

      if (channelName !== profile?.channel_name) {
        updates.channel_name = channelName;
      }

      if (bio !== profile?.bio) {
        updates.bio = bio;
      }

      if (avatarFile) {
        const path = `${profile?.id}/avatar.jpg`;
        const { error } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile, { upsert: true });

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(path);
        updates.avatar_url = urlData.publicUrl;
      }

      if (bannerFile) {
        const path = `${profile?.id}/banner.jpg`;
        const { error } = await supabase.storage
          .from('banners')
          .upload(path, bannerFile, { upsert: true });

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('banners')
          .getPublicUrl(path);
        updates.banner_url = urlData.publicUrl;
      }

      if (Object.keys(updates).length > 0) {
        await updateProfile(updates);
      }

      navigate(`/channel/${profile?.id}`);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const avatarPreview = avatarFile
    ? URL.createObjectURL(avatarFile)
    : profile?.avatar_url;

  const bannerPreview = bannerFile
    ? URL.createObjectURL(bannerFile)
    : profile?.banner_url;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Settings
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Banner image
          </label>
          <div
            onClick={() => document.getElementById('banner-input')?.click()}
            className="relative h-48 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
          >
            <img
              src={bannerPreview}
              alt="Channel banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <input
              id="banner-input"
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              className="hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Avatar
          </label>
          <div
            onClick={() => document.getElementById('avatar-input')?.click()}
            className="relative w-32 h-32 rounded-full overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
          >
            <img
              src={avatarPreview}
              alt="Channel avatar"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Channel name
          </label>
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
