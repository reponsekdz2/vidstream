import { db } from '../../../db.js';

export const getSiteAnalytics = (req, res) => {
    const totalUsers = db.data.users.length;
    const totalVideos = db.data.videos.length;
    const totalViews = db.data.videos.reduce((sum, v) => sum + v.viewCount, 0);
    const totalLikes = db.data.videos.reduce((sum, v) => sum + v.likes, 0);
    const totalComments = db.data.comments.length;

    res.json({
        totalUsers,
        totalVideos,
        totalViews,
        totalLikes,
        totalComments,
    });
};

export const getAllUsersAdmin = (req, res) => {
    const users = db.data.users.map(({ password, ...user }) => user); // Exclude passwords
    res.json(users);
};

export const deleteUserAdmin = async (req, res) => {
    const { userId } = req.params;
    
    if (userId === 'admin-001') {
        return res.status(403).json({ message: 'Cannot delete the main admin account.'});
    }

    db.data.users = db.data.users.filter(u => u.id !== userId);
    // In a real app, also delete their videos, comments, etc.
    await db.write();

    res.status(200).json({ message: 'User deleted successfully.' });
};

export const getAllVideosAdmin = (req, res) => {
    res.json(db.data.videos);
};

export const deleteVideoAdmin = async (req, res) => {
    const { videoId } = req.params;
    const initialVideoCount = db.data.videos.length;
    db.data.videos = db.data.videos.filter(v => v.id !== videoId);
    
    if(db.data.videos.length < initialVideoCount){
        db.data.playlists.forEach(p => {
            p.videoIds = p.videoIds.filter(id => id !== videoId);
        });
        db.data.history = db.data.history.filter(h => h.videoId !== videoId);
        db.data.comments = db.data.comments.filter(c => c.videoId !== videoId);
        
        await db.write();
        res.status(200).json({ message: 'Video deleted successfully.' });
    } else {
        res.status(404).json({ message: 'Video not found.' });
    }
};

// --- Moderation Controllers ---

export const getReports = (req, res) => {
    const pendingReports = db.data.reports
        .filter(r => r.status === 'pending')
        .map(report => {
            let contentDetails = null;
            if (report.contentType === 'video') {
                contentDetails = db.data.videos.find(v => v.id === report.contentId);
            } else if (report.contentType === 'comment') {
                contentDetails = db.data.comments.find(c => c.id === report.contentId);
            }
            return { ...report, contentDetails };
        })
        .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json(pendingReports);
};

export const resolveReport = async (req, res) => {
    const { reportId } = req.params;
    const report = db.data.reports.find(r => r.id === reportId);
    if (report) {
        report.status = 'resolved';
        await db.write();
        res.status(200).json({ message: 'Report resolved.' });
    } else {
        res.status(404).json({ message: 'Report not found.' });
    }
};

export const searchComments = (req, res) => {
    const { q } = req.query;
    if (!q) {
        return res.json([]);
    }
    const searchQuery = q.toString().toLowerCase();
    const matchingComments = db.data.comments.filter(c => c.text.toLowerCase().includes(searchQuery));
    res.json(matchingComments);
};

export const deleteCommentAdmin = async (req, res) => {
    const { commentId } = req.params;
    const initialCommentCount = db.data.comments.length;
    db.data.comments = db.data.comments.filter(c => c.id !== commentId);
    if(db.data.comments.length < initialCommentCount) {
        await db.write();
        res.status(200).json({ message: 'Comment deleted successfully.' });
    } else {
        res.status(404).json({ message: 'Comment not found.' });
    }
};