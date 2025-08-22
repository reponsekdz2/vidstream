import { db } from '../../../db.js';
import { v4 as uuidv4 } from 'uuid';
import { setupHlsStream } from '../../../services/ffmpegService.js';


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

    const videoId = uuidv4();
    // In a real app, you would get the stream key from the user and start an FFmpeg process
    // to ingest the RTMP stream and output HLS.
    // For now, we'll simulate this setup.
    const hlsManifestUrl = setupHlsStream(videoId);

    const newLiveVideo = {
        id: videoId,
        userId: user.id,
        thumbnailUrl: `https://picsum.photos/seed/live${Date.now()}/1280/720`,
        sources: {
            '1080p': hlsManifestUrl,
            '720p': hlsManifestUrl,
            '480p': hlsManifestUrl,
            '360p': hlsManifestUrl,
        },
        videoUrl: hlsManifestUrl,
        videoPreviewUrl: `https://picsum.photos/seed/live${Date.now()}/1280/720`,
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