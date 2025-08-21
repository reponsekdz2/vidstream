import { db } from '../../../db.js';

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

export const getTrending = (req, res) => {
    try {
        const trendingVideos = [...db.data.videos].sort((a, b) => b.viewCount - a.viewCount).slice(0, 10);
        res.json(trendingVideos);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching trending videos.' });
    }
};

export const getCreatorDashboard = (req, res) => {
    const { userId } = req.params;
    try {
        const userVideos = db.data.videos.filter(v => v.userId === userId);
        const creator = db.data.users.find(u => u.id === userId);
        
        if (!creator) return res.status(404).json({ message: 'Creator not found.' });
        if (userVideos.length === 0) {
            return res.json({
                totalViews: 0,
                totalSubscribers: creator.subscribers,
                totalVideos: 0,
                watchTimeHours: 0,
                viewsOverTime: [],
                subscribersOverTime: [],
                videoPerformance: [],
            });
        }

        const totalViews = userVideos.reduce((sum, v) => sum + v.viewCount, 0);
        const totalSubscribers = creator.subscribers;

        const videoPerformance = userVideos.map(video => ({
            video,
            viewCount: video.viewCount,
            likes: video.likes,
            commentCount: video.commentCount,
            avgWatchDuration: `${Math.floor(Math.random() * 5)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        })).sort((a,b) => b.viewCount - a.viewCount).slice(0, 10);

        const viewsOverTime = generateTimeSeries(30, totalViews / 30, 1000).map(d => ({ date: d.date, views: d.value }));
        const subscribersOverTime = generateTimeSeries(30, totalSubscribers / 2, 50).map(d => ({ date: d.date, subscribers: d.value }));
        
        const analytics = {
            totalViews,
            totalSubscribers,
            totalVideos: userVideos.length,
            watchTimeHours: Math.round(totalViews / 200),
            viewsOverTime,
            subscribersOverTime,
            videoPerformance
        };

        res.json(analytics);

    } catch (error) {
        res.status(500).json({ message: 'Error fetching creator analytics.' });
    }
};