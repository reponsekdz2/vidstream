import { users } from '../../../../data/users.js';
import { videos } from '../../../../data/db.js';

export const getUserById = (req, res) => {
    const { id } = req.params;
    const user = users.find(u => u.id === id);
    if (user) {
        const { password, ...userToReturn } = user;
        res.json(userToReturn);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

export const updateUserProfile = (req, res) => {
    const { id } = req.params;
    const { name, avatarUrl } = req.body;
    
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
    }

    if (name) {
        users[userIndex].name = name;
    }
    if (avatarUrl) {
        users[userIndex].avatarUrl = avatarUrl;
    }
    
    const { password, ...updatedUser } = users[userIndex];
    res.json(updatedUser);
};

export const getUserVideos = (req, res) => {
    const { id } = req.params;
    const userVideos = videos.filter(v => v.userId === id);
    res.json(userVideos);
};

export const toggleSubscription = (req, res) => {
    const { userId, channelId } = req.body;
    
    const user = users.find(u => u.id === userId);
    const channel = users.find(u => u.id === channelId);

    if (!user || !channel) {
        return res.status(404).json({ message: "User or channel not found" });
    }

    const isSubscribed = user.subscriptions.includes(channelId);

    if (isSubscribed) {
        // Unsubscribe
        user.subscriptions = user.subscriptions.filter(id => id !== channelId);
        channel.subscribers -= 1;
    } else {
        // Subscribe
        user.subscriptions.push(channelId);
        channel.subscribers += 1;
    }

    res.status(200).json({ subscriptions: user.subscriptions });
};

export const getUserSubscriptions = (req, res) => {
    const { id } = req.params;
    const user = users.find(u => u.id === id);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const subscriptionDetails = user.subscriptions.map(channelId => {
        const channel = users.find(u => u.id === channelId);
        const channelVideos = videos.filter(v => v.userId === channelId).slice(0, 5); // Get latest 5
        const { password, ...channelInfo } = channel;
        return { channel: channelInfo, videos: channelVideos };
    });

    res.json(subscriptionDetails);
};