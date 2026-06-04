import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Video } from '../lib/types';
import { Heart, MessageCircle, Share2, ChevronUp, ChevronDown } from 'lucide-react';

export default function ShortsPage() {
  const [shorts, setShorts] = useState<Video[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchShorts();
  }, []);

  const fetchShorts = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('visibility', 'public')
        .limit(20)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShorts(data || []);
    } catch (error) {
      console.error('Error fetching shorts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (videoId: string) => {
    if (likedVideos.has(videoId)) {
      setLikedVideos(prev => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
    } else {
      setLikedVideos(prev => new Set(prev).add(videoId));
    }
  };

  const handleNextShort = () => {
    setCurrentIndex((prev) => (prev + 1) % shorts.length);
  };

  const handlePrevShort = () => {
    setCurrentIndex((prev) => (prev - 1 + shorts.length) % shorts.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">Loading shorts...</p>
      </div>
    );
  }

  if (shorts.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">No shorts available</p>
      </div>
    );
  }

  const currentShort = shorts[currentIndex];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="relative w-full max-w-md h-screen max-h-screen">
        <div className="relative h-full bg-black rounded-lg overflow-hidden">
          <video
            src={currentShort.video_url}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted={false}
            controls
          />

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
            <div className="flex items-start justify-between">
              <div className="flex-1 mr-4">
                <h3 className="text-white font-bold text-lg truncate">
                  {currentShort.title}
                </h3>
                <p className="text-gray-300 text-sm truncate">
                  {currentShort.description}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => handleLike(currentShort.id)}
                  className={`flex flex-col items-center gap-1 ${
                    likedVideos.has(currentShort.id)
                      ? 'text-red-500'
                      : 'text-white'
                  }`}
                >
                  <Heart
                    size={24}
                    fill={likedVideos.has(currentShort.id) ? 'currentColor' : 'none'}
                  />
                  <span className="text-xs">{currentShort.likes_count}</span>
                </button>

                <button className="text-white flex flex-col items-center gap-1">
                  <MessageCircle size={24} />
                  <span className="text-xs">{currentShort.comments_count}</span>
                </button>

                <button className="text-white flex flex-col items-center gap-1">
                  <Share2 size={24} />
                  <span className="text-xs">Share</span>
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handlePrevShort}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white z-10 hover:scale-110 transition"
          >
            <ChevronUp size={32} />
          </button>

          <button
            onClick={handleNextShort}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white z-10 hover:scale-110 transition"
          >
            <ChevronDown size={32} />
          </button>

          <div className="absolute top-4 left-4 text-white text-sm">
            {currentIndex + 1} / {shorts.length}
          </div>
        </div>
      </div>
    </div>
  );
}
