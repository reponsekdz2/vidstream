import { db } from '../../../db.js';
import { v4 as uuidv4 } from 'uuid';

export const getComments = (req, res) => {
    const { videoId } = req.params;
    const videoComments = db.data.comments
        .filter(c => c.videoId === videoId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json(videoComments);
};

export const postComment = async (req, res) => {
    const { videoId } = req.params;
    const { userId, text } = req.body;

    const user = db.data.users.find(u => u.id === userId);
    const video = db.data.videos.find(v => v.id === videoId);

    if (!user || !video) {
        return res.status(404).json({ message: 'User or video not found.' });
    }
    if (!text || !text.trim()) {
        return res.status(400).json({ message: 'Comment text cannot be empty.' });
    }

    const newComment = {
        id: uuidv4(),
        videoId,
        user: {
            id: user.id,
            name: user.name,
            avatarUrl: user.avatarUrl,
        },
        text,
        timestamp: new Date().toISOString(),
    };

    db.data.comments.unshift(newComment);
    video.commentCount += 1;
    await db.write();
    
    res.status(201).json(newComment);
};