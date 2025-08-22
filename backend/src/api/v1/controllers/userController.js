import { db } from '../../db.js';

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
    const { name, about, featuredVideoId, socialLinks } = req.body;
    const avatarFile = req.files?.avatar?.[0];
    const bannerFile = req.files?.banner?.[0];
    
    const userIndex = db.data.users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
    }
    
    const user = db.data.users[userIndex];

    if (name) user.name = name;
    if (about) user.about = about;
    if (featuredVideoId) user.featuredVideoId = featuredVideoId;
    if (socialLinks) user.socialLinks = JSON.parse(socialLinks);
    if (avatarFile) user.avatarUrl = `/uploads/${avatarFile.filename}`;
    if (bannerFile) user.bannerUrl = `/uploads/${bannerFile.filename}`;
    
    db.data.users[userIndex] = user;

    // Also update user info embedded in their videos
    db.data.videos.forEach((video, index) => {
        if (video.userId === id) {
            db.data.videos[index].user.name = user.name;
            db.data.videos[index].user.avatarUrl = user.avatarUrl;
        }
    });

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
        if (!channel) return null;
        const channelVideos = db.data.videos.filter(v => v.userId === channelId).slice(0, 5); // Get latest 5
        const { password, ...channelInfo } = channel;
        return { channel: channelInfo, videos: channelVideos };
    }).filter(Boolean);

    res.json(subscriptionDetails);
};


// New settings controllers
export const getUserSettings = (req, res) => {
    const { id } = req.params;
    const user = db.data.users.find(u => u.id === id);
    if (user) {
        res.json(user.settings);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

export const updateUserSettings = async (req, res) => {
    const { id } = req.params;
    const newSettings = req.body;
    const userIndex = db.data.users.findIndex(u => u.id === id);

    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
    }

    db.data.users[userIndex].settings = {
        ...db.data.users[userIndex].settings,
        ...newSettings
    };
    await db.write();

    const { password, ...updatedUser } = db.data.users[userIndex];
    res.json(updatedUser);
};