import { db } from '../../db.js';
import { v4 as uuidv4 } from 'uuid';

export const createClip = async (req, res) => {
    const { videoId, userId, title, startTime, endTime } = req.body;
    
    const user = db.data.users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }

    const newClip = {
        id: uuidv4(),
        videoId,
        userId,
        user: {
            name: user.name,
            avatarUrl: user.avatarUrl,
        },
        title,
        startTime,
        endTime,
        createdAt: new Date().toISOString(),
    };

    db.data.clips.push(newClip);
    await db.write();

    res.status(201).json(newClip);
};