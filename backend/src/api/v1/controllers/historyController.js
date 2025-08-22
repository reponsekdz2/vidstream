import { db } from '../../db.js';
import { v4 as uuidv4 } from 'uuid';

export const getUserHistory = (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required.' });
    }

    const userHistory = db.data.history
        .filter(h => h.userId === userId)
        .map(h => ({
            ...h,
            video: db.data.videos.find(v => v.id === h.videoId)
        }))
        .filter(h => h.video) // Ensure video exists
        .sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime());

    res.json(userHistory);
};

export const addToHistory = async (req, res) => {
    const { userId, videoId } = req.body;
    if (!userId || !videoId) {
        return res.status(400).json({ message: 'User ID and Video ID are required.' });
    }
    
    // Remove existing entry for this video to move it to the top
    const existingIndex = db.data.history.findIndex(h => h.userId === userId && h.videoId === videoId);
    if (existingIndex > -1) {
        db.data.history.splice(existingIndex, 1);
    }

    const newHistoryItem = {
        id: uuidv4(),
        userId,
        videoId,
        watchedAt: new Date().toISOString(),
    };

    db.data.history.unshift(newHistoryItem); // Add to the beginning
    await db.write();

    res.status(201).json(newHistoryItem);
};