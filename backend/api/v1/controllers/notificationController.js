import { notifications } from '../../../../data/notifications.js';

export const getNotifications = (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required.' });
    }
    // In a real app, you'd filter notifications for the specific user.
    // For this mock, we return all notifications.
    const userNotifications = notifications.filter(n => n.userId === userId);
    res.json(userNotifications);
};
