import { db } from '../../../db.js';
import { v4 as uuidv4 } from 'uuid';

export const getAllLive = (req, res) => {
    const liveVideos = db.data.videos.filter(v => v.isLive);
    res.json(liveVideos);
};

export const getLiveChat = (req, res) => {
    const { videoId } = req.params;
    const chat = db.data.liveChatMessages.filter(msg => msg.videoId === videoId);
    res.json(chat);
};

export const startLiveStream = async (req, res) => {
    const { userId, title, description } = req.body;
    const user = db.data.users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const newLiveVideo = {
        id: uuidv4(),
        userId: user.id,
        thumbnailUrl: `https://picsum.photos/seed/live${Date.now()}/1280/720`,
        sources: {
            '1080p': 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            '720p': 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            '480p': 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            '360p': 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        },
        videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        videoPreviewUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        title,
        duration: 'LIVE',
        durationSeconds: 0,
        user: {
            id: user.id,
            name: user.name,
            avatarUrl: user.avatarUrl,
            subscribers: user.subscribers,
        },
        views: '1 watching',
        viewCount: 1,
        commentCount: 0,
        isLive: true,
        uploadedAt: 'Just now',
        uploadDate: new Date().toISOString(),
        description,
        genre: 'Live',
        likes: 0,
        visibility: 'public',
    };

    db.data.videos.unshift(newLiveVideo);
    await db.write();

    res.status(201).json(newLiveVideo);
};

export const stopLiveStream = async (req, res) => {
    const { videoId } = req.params;
    const video = db.data.videos.find(v => v.id === videoId);

    if (video && video.isLive) {
        video.isLive = false;
        video.duration = '2:15:03'; // Example duration
        await db.write();
        res.status(200).json({ message: 'Stream ended successfully.' });
    } else {
        res.status(404).json({ message: 'Live stream not found.' });
    }
};