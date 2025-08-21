import { videos } from './db.js';

// Helper to generate time series data
const generateTimeSeries = (days, startValue, growthFactor) => {
  const data = [];
  let value = startValue;
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    value += Math.random() * growthFactor - (growthFactor / 2.5);
    if (value < 0) value = 0;
    data.push({ date: date.toISOString().split('T')[0], value: Math.round(value) });
  }
  return data;
};

// Generate analytics for a specific creator
export const getCreatorAnalytics = (userId) => {
  const userVideos = videos.filter(v => v.userId === userId);

  if (userVideos.length === 0) return null;

  const totalViews = userVideos.reduce((sum, v) => sum + v.viewCount, 0);
  const totalLikes = userVideos.reduce((sum, v) => sum + v.likes, 0);
  
  // Find user to get subscriber count
  const creator = videos.find(v => v.userId === userId)?.user;
  const totalSubscribers = creator ? creator.subscribers : 0;

  const videoPerformance = userVideos.map(video => ({
    video,
    viewCount: video.viewCount,
    likes: video.likes,
    commentCount: video.commentCount,
    avgWatchDuration: `${Math.floor(Math.random() * 5)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
  })).sort((a,b) => b.viewCount - a.viewCount).slice(0, 10);

  const viewsOverTime = generateTimeSeries(30, totalViews / 30, 1000).map(d => ({ date: d.date, views: d.value }));
  const subscribersOverTime = generateTimeSeries(30, totalSubscribers / 2, 50).map(d => ({ date: d.date, subscribers: d.value }));

  return {
    totalViews,
    totalSubscribers,
    totalVideos: userVideos.length,
    watchTimeHours: Math.round(totalViews / 200), // A made-up metric
    viewsOverTime,
    subscribersOverTime,
    videoPerformance
  };
};

// Get trending videos (top 10 by view count)
export const getTrendingVideos = () => {
    return [...videos].sort((a, b) => b.viewCount - a.viewCount).slice(0, 10);
};