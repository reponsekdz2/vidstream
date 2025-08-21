import { db } from '../../../db.js';

export const getUserById = (req, res) => {
    const { id } = req.params;
    const user = db.data.users.find(u => u.id === id);
    if (user) {
        const { password, ...userToReturn } = user;
        res.json(userToReturn);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

export const updateUserProfile = async (req, res) => {
    const { id } = req.params;
    const { name, avatarUrl } = req.body;
    
    const user = db.data.users.find(u => u.id === id);
    
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (avatarUrl) user.avatarUrl = avatarUrl;
    
    await db.write();

    const { password, ...updatedUser } = user;
    res.json(updatedUser);
};

export const getUserVideos = (req, res) => {
    const { id } = req.params;
    const userVideos = db.data.videos.filter(v => v.userId === id);
    res.json(userVideos);
};

export const toggleSubscription = async (req, res) => {
    const { userId, channelId } = req.body;
    
    const user = db.data.users.find(u => u.id === userId);
    const channel = db.data.users.find(u => u.id === channelId);

    if (!user || !channel) {
        return res.status(404).json({ message: "User or channel not found" });
    }

    const isSubscribed = user.subscriptions.includes(channelId);

    if (isSubscribed) {
        user.subscriptions = user.subscriptions.filter(id => id !== channelId);
        channel.subscribers -= 1;
    } else {
        user.subscriptions.push(channelId);
        channel.subscribers += 1;
    }
    
    await db.write();

    res.status(200).json({ subscriptions: user.subscriptions });
};

export const getUserSubscriptions = (req, res) => {
    const { id } = req.params;
    const user = db.data.users.find(u => u.id === id);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const subscriptionDetails = user.subscriptions.map(channelId => {
        const channel = db.data.users.find(u => u.id === channelId);
        const channelVideos = db.data.videos.filter(v => v.userId === channelId).slice(0, 5); // Get latest 5
        const { password, ...channelInfo } = channel;
        return { channel: channelInfo, videos: channelVideos };
    });

    res.json(subscriptionDetails);
};