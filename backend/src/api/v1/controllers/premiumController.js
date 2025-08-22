import { db } from '../../../db.js';

export const subscribe = async (req, res) => {
    const { userId } = req.body;
    if (!db.data.premiumUsers.includes(userId)) {
        db.data.premiumUsers.push(userId);
        await db.write();
    }
    res.status(200).json({ isPremium: true });
};

export const cancel = async (req, res) => {
    const { userId } = req.body;
    db.data.premiumUsers = db.data.premiumUsers.filter(id => id !== userId);
    await db.write();
    res.status(200).json({ isPremium: false });
};

export const getStatus = (req, res) => {
    const { userId } = req.params;
    const isPremium = db.data.premiumUsers.includes(userId);
    res.json({ isPremium });
};