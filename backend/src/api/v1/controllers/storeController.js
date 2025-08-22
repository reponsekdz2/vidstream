import { db } from '../../db.js';

export const getMerchForChannel = (req, res) => {
    const { channelId } = req.params;
    const merch = db.data.merch.filter(item => item.channelId === channelId);
    res.json(merch);
};