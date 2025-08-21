import { db } from '../../../db.js';
import { v4 as uuidv4 } from 'uuid';

export const getComments = (req, res) => {
    const { videoId } = req.params;
    const video = db.data.videos.find(v => v.id === videoId);
    if (!video) return res.status(404).json({ message: 'Video not found.' });

    const creator = db.data.users.find(u => u.id === video.userId);
    const bannedWords = creator?.bannedWords || [];

    const videoComments = db.data.comments
        .filter(c => {
            if (c.videoId !== videoId) return false;
            // Filter out comments with banned words
            const hasBannedWord = bannedWords.some(word => c.text.toLowerCase().includes(word.toLowerCase()));
            return !hasBannedWord;
        })
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

    const creator = db.data.users.find(u => u.id === video.userId);
    if (creator && creator.blockedUsers?.includes(userId)) {
        return res.status(403).json({ message: 'You are blocked from commenting on this channel.' });
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