import { comments } from '../../../../data/comments.js';
import { users } from '../../../../data/users.js';
import { videos } from '../../../../data/db.js';

export const getComments = (req, res) => {
    const { videoId } = req.params;
    const videoComments = comments
        .filter(c => c.videoId === videoId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Mock sorting
    res.json(videoComments);
};

export const postComment = (req, res) => {
    const { videoId } = req.params;
    const { userId, text } = req.body;

    const user = users.find(u => u.id === userId);
    const video = videos.find(v => v.id === videoId);

    if (!user || !video) {
        return res.status(404).json({ message: 'User or video not found.' });
    }
    if (!text || !text.trim()) {
        return res.status(400).json({ message: 'Comment text cannot be empty.' });
    }

    const newComment = {
        id: `comment-${Date.now()}`,
        videoId,
        user: {
            id: user.id,
            name: user.name,
            avatarUrl: user.avatarUrl,
        },
        text,
        timestamp: new Date().toISOString(), // Use ISO string for sorting
    };

    comments.unshift(newComment);
    res.status(201).json(newComment);
};