import { db } from '../../../db.js';

export const getAllLive = (req, res) => {
    const liveVideos = db.data.videos.filter(v => v.isLive);
    res.json(liveVideos);
};

export const getLiveChat = (req, res) => {
    const { videoId } = req.params;
    const chat = db.data.liveChatMessages.filter(msg => msg.videoId === videoId);
    res.json(chat);
};