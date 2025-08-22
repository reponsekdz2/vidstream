export interface UserSettings {
  notifications: {
    newUploads: boolean;
    comments: boolean;
    mentions: boolean;
  };
  playback: {
    defaultQuality: 'Auto' | '1080p' | '720p' | '480p';
    autoplay: boolean;
  };
  privacy: {
    showLikedVideos: boolean;
    showSubscriptions: boolean;
  };
}

export interface ChannelLayoutShelf {
  id: string;
  type: 'LATEST_UPLOADS' | 'POPULAR_UPLOADS' | 'PLAYLIST';
  title: string;
  playlistId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatarUrl?: string; 
  bannerUrl?: string;
  about?: string;
  featuredVideoId?: string;
  socialLinks?: { [key: string]: string };
  subscribers: number;
  subscriptions: string[];
  settings: UserSettings;
  channelLayout: ChannelLayoutShelf[];
  blockedUsers: string[];
  bannedWords: string[];
  role: 'USER' | 'ADMIN';
}

export interface VideoChapter {
    time: number; // in seconds
    title: string;
}

export interface Video {
  id: string;
  userId: string;
  thumbnailUrl: string;
  videoUrl: string;
  videoPreviewUrl: string;
  title: string;
  duration: string; // "MM:SS"
  durationSeconds: number;
  user: {
    id: string;
    name: string;
    avatarUrl: string;
    subscribers: number;
  };
  views: string;
  viewCount: number;
  commentCount: number;
  isLive: boolean;
  uploadedAt: string;
  uploadDate: string; // ISO String
  description: string;
  genre: string;
  likes: number;
  premiereTime?: string; // ISO String
  chapters?: VideoChapter[];
}

export interface Short {
  id:string;
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
    parentId?: string | null;
    replies?: Comment[];
    replyCount?: number;
    isSuperThanks?: boolean;
    superThanksAmount?: number;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface CommunityPost {
  id: string;
  userId: string;
  user: {
    name: string;
    avatarUrl: string;
  };
  text: string;
  imageUrl?: string;
  poll?: PollOption[];
  likes: number;
  timestamp: string;
  userVote?: string; // Option ID
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

export interface VideoAnalytics {
    video: Video;
    viewCount: number;
    likes: number;
    commentCount: number;
    avgWatchDuration: string; // e.g., "3:45"
    sentiment?: { positive: number; neutral: number; negative: number; };
}

export interface CreatorAnalytics {
    totalViews: number;
    totalSubscribers: number;
    totalVideos: number;
    watchTimeHours: number;
    viewsOverTime: { date: string; views: number }[];
    subscribersOverTime: { date: string; subscribers: number }[];
    videoPerformance: VideoAnalytics[];
}

export interface MonetizationData {
    isEligible: boolean;
    subscribers: { current: number; required: number };
    watchHours: { current: number; required: number };
    estimatedEarnings: { month: string; earnings: number }[];
    superThanksRevenue: number;
    membershipRevenue: number;
}


export interface LiveChatMessage {
    id: string;
    user: {
        name: string;
        avatarUrl: string;
        isMod?: boolean;
    };
    message: string;
}

export interface MembershipTier {
    id: string;
    channelId: string;
    name: string;
    price: number;
    perks: string[];
}

export interface Transaction {
    id: string;
    type: 'SUPER_THANKS' | 'MEMBERSHIP';
    amount: number;
    fromUserId: string;
    toUserId: string; // The creator
    videoId?: string;
    tierId?: string;
    timestamp: string; // ISO String
}

export interface Ad {
    id: string;
    videoUrl: string;
    duration: number; // in seconds
}

export interface Premiere {
    videoId: string;
    premiereTime: string; // ISO String
}

export interface Report {
  id: string;
  contentType: 'video' | 'comment';
  contentId: string;
  reporterId: string;
  reason: string;
  timestamp: string; // ISO String
  status: 'pending' | 'resolved';
  contentDetails?: Video | Comment; // To be populated on the backend for admin view
}

export interface SearchFilters {
  uploadDate: 'any' | 'hour' | 'today' | 'week' | 'month' | 'year';
  duration: 'any' | 'short' | 'medium' | 'long';
  sortBy: 'relevance' | 'date' | 'views';
}