import { db } from '../../../db.js';
import { v4 as uuidv4 } from 'uuid';

export const getCommentsForVideo = (req, res) => {
    const { videoId } = req.params;
    const video = db.data.videos.find(v => v.id === videoId);
    if (!video) return res.status(404).json({ message: 'Video not found.' });

    const creator = db.data.users.find(u => u.id === video.userId);
    const bannedWords = creator?.bannedWords || [];

    const topLevelComments = db.data.comments
        .filter(c => c.videoId === videoId && !c.parentId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
    const commentsWithReplies = topLevelComments.map(comment => {
        const replyCount = db.data.comments.filter(r => r.parentId === comment.id).length;
        const hasBannedWord = bannedWords.some(word => comment.text.toLowerCase().includes(word.toLowerCase()));
        if (hasBannedWord) return null; // Filter out comment itself if it has banned words
        return { ...comment, replyCount };
    }).filter(Boolean);

    res.json(commentsWithReplies);
};

export const postComment = async (req, res) => {
    const { videoId } = req.params;
    const { userId, text } = req.body;
    return await createComment(req, res, videoId, text, userId, null);
};

export const postReply = async (req, res) => {
    const { commentId } = req.params;
    const { userId, text } = req.body;
    const parentComment = db.data.comments.find(c => c.id === commentId);
    if (!parentComment) return res.status(404).json({ message: 'Parent comment not found' });
    
    return await createComment(req, res, parentComment.videoId, text, userId, commentId);
};

export const getReplies = (req, res) => {
    const { commentId } = req.params;
    const replies = db.data.comments
        .filter(c => c.parentId === commentId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    res.json(replies);
};


// Helper function
const createComment = async (req, res, videoId, text, userId, parentId) => {
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
        parentId,
        user: {
            id: user.id,
            name: user.name,
            avatarUrl: user.avatarUrl,
        },
        text,
        timestamp: new Date().toISOString(),
    };

    db.data.comments.unshift(newComment);
    if (!parentId) {
        video.commentCount += 1;
    }
    await db.write();
    
    res.status(201).json(newComment);
};