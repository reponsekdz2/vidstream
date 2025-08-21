export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatarUrl: string;
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