export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatarUrl?: string; // Optional for letter-based default
  subscribers: number;
  subscriptions: string[]; // Array of user IDs
}

export interface Video {
  id: string;
  userId: string;
  thumbnailUrl: string;
  videoUrl: string;
  videoPreviewUrl: string;
  title: string;
  duration: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string;
    subscribers: string;
  };
  views: string;
  uploadedAt: string;
  description: string;
  genre: string;
  likes: number;
}

export interface Short {
  id: string;
  videoUrl: string;
  user: {
    name: string;
    avatarUrl: string;
    subscribers: string;
  };
  title: string;
  likes: string;
  comments: string;
}

export interface Subscription {
  channel: User;
  videos: Video[];
}

export interface Comment {
    id: string;
    videoId: string;
    user: {
        id: string;
        name: string;
        avatarUrl: string;
    };
    text: string;
    timestamp: string;
}

export interface Playlist {
    id: string;
    userId: string;
    name: string;
    description: string;
    videoIds: string[];
    thumbnailUrl: string; // URL of the first video in the playlist
}

export interface HistoryItem {
    id: string;
    userId: string;
    videoId: string;
    watchedAt: string; // ISO string
    video: Video;
}

export interface Notification {
    id: string;
    userId: string;
    text: string;
    timestamp: string;
    isRead: boolean;
    link: string;
}