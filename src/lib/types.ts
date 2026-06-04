export interface Profile {
  id: string;
  email: string;
  channel_name: string;
  avatar_url: string;
  banner_url: string;
  bio: string;
  created_at: string;
}

export interface Video {
  id: string;
  user_id: string;
  video_url: string;
  thumbnail_url: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  duration: number;
  views_count: number;
  visibility: string;
  created_at: string;
  profiles?: Profile;
}

export interface Comment {
  id: string;
  video_id: string;
  user_id: string;
  text: string;
  created_at: string;
  profiles?: Profile;
}

export interface Like {
  id: string;
  video_id: string;
  user_id: string;
  type: 'like' | 'dislike';
  created_at: string;
}

export interface Subscription {
  id: string;
  subscriber_id: string;
  channel_id: string;
  created_at: string;
}

export interface VideoWithDetails extends Video {
  likes_count?: number;
  dislikes_count?: number;
  comments_count?: number;
  user_like?: 'like' | 'dislike' | null;
}
