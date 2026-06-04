import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, MoreVertical, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Comment, Profile } from '../../lib/types';

interface CommentSectionProps {
  videoId: string;
}

export default function CommentSection({ videoId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<(Comment & { profiles: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  async function fetchComments() {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles!comments_user_id_fkey(*)')
        .eq('video_id', videoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !commentText.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('comments').insert({
        video_id: videoId,
        user_id: user.id,
        text: commentText.trim(),
      });

      if (error) throw error;
      setCommentText('');
      await fetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        {comments.length} Comments
      </h3>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <img
              src={user.user_metadata?.avatar_url || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150'}
              alt="Your avatar"
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 focus:border-blue-500 outline-none py-2 px-1 text-gray-900 dark:text-white"
              />
              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setCommentText('')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!commentText.trim() || submitting}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Sign in to leave a comment
          </p>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isOwner={user?.id === comment.user_id}
              onDelete={() => handleDeleteComment(comment.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CommentItemProps {
  comment: Comment & { profiles: Profile };
  isOwner: boolean;
  onDelete: () => void;
}

function CommentItem({ comment, isOwner, onDelete }: CommentItemProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex gap-3">
      <img
        src={comment.profiles.avatar_url}
        alt={comment.profiles.channel_name}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-gray-900 dark:text-white">
            {comment.profiles.channel_name}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="text-gray-800 dark:text-gray-200 text-sm">{comment.text}</p>
        <div className="flex items-center gap-2 mt-2">
          <button className="flex items-center gap-1 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <ThumbsUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="flex items-center gap-1 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <ThumbsDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          {isOwner && (
            <div className="relative ml-auto">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                    <button
                      onClick={onDelete}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
