import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Image, Video, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const CATEGORIES = [
  'Entertainment',
  'Music',
  'Gaming',
  'Education',
  'Science & Technology',
  'Sports',
  'News',
  'Comedy',
  'Howto & Style',
  'People & Blogs',
];

export default function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [category, setCategory] = useState('Entertainment');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'video/mp4') {
        alert('Please select an MP4 video file');
        return;
      }
      setVideoFile(file);

      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        setVideoDuration(Math.floor(video.duration));
        URL.revokeObjectURL(video.src);
      };
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      setThumbnailFile(file);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !videoFile) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const videoId = crypto.randomUUID();
      const videoPath = `${user.id}/${videoId}/video.mp4`;
      const thumbnailPath = `${user.id}/${videoId}/thumbnail.jpg`;

      setUploadProgress(10);

      const { error: videoError } = await supabase.storage
        .from('videos')
        .upload(videoPath, videoFile);

      if (videoError) throw videoError;
      setUploadProgress(50);

      let thumbnailUrl =
        'https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg?auto=compress&cs=tinysrgb&w=640';

      if (thumbnailFile) {
        const { error: thumbnailError } = await supabase.storage
          .from('videos')
          .upload(thumbnailPath, thumbnailFile);

        if (thumbnailError) throw thumbnailError;

        const { data: urlData } = supabase.storage
          .from('videos')
          .getPublicUrl(thumbnailPath);
        thumbnailUrl = urlData.publicUrl;
      }
      setUploadProgress(80);

      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(videoPath);

      const { error: insertError } = await supabase.from('videos').insert({
        id: videoId,
        user_id: user.id,
        video_url: urlData.publicUrl,
        thumbnail_url: thumbnailUrl,
        title,
        description,
        tags,
        category,
        duration: videoDuration,
        visibility,
      });

      if (insertError) throw insertError;
      setUploadProgress(100);

      navigate(`/watch/${videoId}`);
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Error uploading video. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-14 pl-[72px]">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Upload video
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Video file*
          </label>
          <div
            onClick={() => videoInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition-colors"
          >
            {videoFile ? (
              <div className="flex items-center justify-center gap-2">
                <Video className="w-6 h-6 text-green-600" />
                <span className="text-gray-900 dark:text-white">{videoFile.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setVideoFile(null);
                  }}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Click to select MP4 video file
                </p>
              </>
            )}
          </div>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4"
            onChange={handleVideoSelect}
            className="hidden"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Thumbnail (optional)
          </label>
          <div
            onClick={() => thumbnailInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
          >
            {thumbnailFile ? (
              <div className="relative inline-block">
                <img
                  src={URL.createObjectURL(thumbnailFile)}
                  alt="Thumbnail preview"
                  className="max-h-40 rounded"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setThumbnailFile(null);
                  }}
                  className="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Image className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600 dark:text-gray-400">
                  Click to select thumbnail image
                </p>
              </>
            )}
          </div>
          <input
            ref={thumbnailInputRef}
            type="file"
            accept="image/*"
            onChange={handleThumbnailSelect}
            className="hidden"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title*
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add title"
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell viewers about your video"
            rows={5}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300"
              >
                <Tag className="w-3 h-3" />
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              placeholder="Add tag"
              className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Visibility
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={visibility === 'public'}
                onChange={() => setVisibility('public')}
                className="w-4 h-4"
              />
              <span className="text-gray-900 dark:text-white">Public</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={visibility === 'private'}
                onChange={() => setVisibility('private')}
                className="w-4 h-4"
              />
              <span className="text-gray-900 dark:text-white">Private</span>
            </label>
          </div>
        </div>

        {uploading && (
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
            <div
              className="bg-red-600 h-2 rounded-full transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            By uploading, you agree to YOUSHOW's Terms of Service
          </p>
          <button
            type="submit"
            disabled={!videoFile || !title || uploading}
            className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload video'}
          </button>
        </div>
      </form>
    </div>
  </div>
  </div>
);
}
