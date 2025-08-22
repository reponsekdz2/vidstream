import { db } from '../../db.js';
import { v4 as uuidv4 } from 'uuid';

// Layout
export const getChannelLayout = (req, res) => {
    const { id } = req.params;
    const user = db.data.users.find(u => u.id === id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.channelLayout || []);
};

export const updateChannelLayout = async (req, res) => {
    const { id } = req.params;
    const { layout } = req.body;
    const user = db.data.users.find(u => u.id === id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.channelLayout = layout;
    await db.write();
    res.status(200).json(user.channelLayout);
};

// Community Posts
export const getCommunityPosts = (req, res) => {
    const { id } = req.params;
    const posts = db.data.communityPosts
        .filter(p => p.userId === id)
        .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json(posts);
};

export const createCommunityPost = async (req, res) => {
    const { id: userId } = req.params;
    const { text, imageUrl, pollOptions } = req.body;
    
    const user = db.data.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newPost = {
        id: uuidv4(),
        userId,
        user: { name: user.name, avatarUrl: user.avatarUrl },
        text,
        imageUrl,
        poll: pollOptions ? pollOptions.map((opt: string) => ({ id: uuidv4(), text: opt, votes: 0 })) : undefined,
        likes: 0,
        timestamp: new Date().toISOString(),
    };
    db.data.communityPosts.unshift(newPost);
    await db.write();
    res.status(201).json(newPost);
};

export const voteOnPoll = async (req, res) => {
    const { postId } = req.params;
    const { optionId } = req.body;

    const post = db.data.communityPosts.find(p => p.id === postId);
    if (!post || !post.poll) return res.status(404).json({ message: 'Post or poll not found' });

    const option = post.poll.find(o => o.id === optionId);
    if (!option) return res.status(404).json({ message: 'Poll option not found' });

    option.votes += 1;
    await db.write();
    res.status(200).json(post);
};


// Moderation
export const updateModeration = async (req, res) => {
    const { id } = req.params;
    const { bannedWords, blockedUsers } = req.body;
    const user = db.data.users.find(u => u.id === id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (bannedWords) user.bannedWords = bannedWords;
    if (blockedUsers) user.blockedUsers = blockedUsers;
    
    await db.write();

    const { password, ...userToReturn } = user;
    res.status(200).json(userToReturn);
};