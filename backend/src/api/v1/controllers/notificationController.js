import { db } from '../../../db.js';

export const getNotifications = (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required.' });
    }
    const userNotifications = db.data.notifications.filter(n => n.userId === userId);
    res.json(userNotifications);
};