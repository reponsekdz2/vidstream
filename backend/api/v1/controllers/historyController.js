import { history } from '../../../../data/history.js';
import { videos } from '../../../../data/db.js';

export const getUserHistory = (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required.' });
    }

    const userHistory = history
        .filter(h => h.userId === userId)
        .map(h => ({
            ...h,
            video: videos.find(v => v.id === h.videoId)
        }))
        .filter(h => h.video) // Ensure video exists
        .sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime());

    res.json(userHistory);
};

export const addToHistory = (req, res) => {
    const { userId, videoId } = req.body;
    if (!userId || !videoId) {
        return res.status(400).json({ message: 'User ID and Video ID are required.' });
    }
    
    // Remove existing entry for this video to move it to the top
    const existingIndex = history.findIndex(h => h.userId === userId && h.videoId === videoId);
    if (existingIndex > -1) {
        history.splice(existingIndex, 1);
    }

    const newHistoryItem = {
        id: `hist-${Date.now()}`,
        userId,
        videoId,
        watchedAt: new Date().toISOString(),
    };

    history.unshift(newHistoryItem); // Add to the beginning
    res.status(201).json(newHistoryItem);
};
