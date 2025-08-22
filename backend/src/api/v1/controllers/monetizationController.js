import { db } from '../../db.js';
import { v4 as uuidv4 } from 'uuid';

// Super Thanks
export const createSuperThanks = async (req, res) => {
    const { fromUserId, toUserId, videoId, amount } = req.body;
    
    const newTransaction = {
        id: uuidv4(),
        type: 'SUPER_THANKS',
        amount,
        fromUserId,
        toUserId,
        videoId,
        timestamp: new Date().toISOString(),
    };

    db.data.transactions.push(newTransaction);
    await db.write();

    res.status(201).json(newTransaction);
};

// Membership Tiers
export const getChannelTiers = (req, res) => {
    const { channelId } = req.params;
    const tiers = db.data.membershipTiers.filter(t => t.channelId === channelId);
    res.json(tiers);
};

export const createMembershipTier = async (req, res) => {
    const { channelId } = req.params;
    const { name, price, perks } = req.body;

    const newTier = {
        id: uuidv4(),
        channelId,
        name,
        price,
        perks
    };

    db.data.membershipTiers.push(newTier);
    await db.write();
    res.status(201).json(newTier);
};

export const updateMembershipTier = async (req, res) => {
    const { tierId } = req.params;
    const { name, price, perks } = req.body;
    
    const tierIndex = db.data.membershipTiers.findIndex(t => t.id === tierId);
    if (tierIndex === -1) {
        return res.status(404).json({ message: 'Tier not found' });
    }

    const tier = db.data.membershipTiers[tierIndex];
    if (name) tier.name = name;
    if (price) tier.price = price;
    if (perks) tier.perks = perks;
    
    db.data.membershipTiers[tierIndex] = tier;
    await db.write();
    res.json(tier);
};

export const deleteMembershipTier = async (req, res) => {
    const { tierId } = req.params;
    db.data.membershipTiers = db.data.membershipTiers.filter(t => t.id !== tierId);
    await db.write();
    res.status(204).send();
};

// Subscribing to a tier
export const subscribeToTier = async (req, res) => {
    const { userId, tierId } = req.body;
    const tier = db.data.membershipTiers.find(t => t.id === tierId);
    const user = db.data.users.find(u => u.id === userId);

    if (!tier || !user) {
        return res.status(404).json({ message: 'Membership tier or user not found.' });
    }

    // Add membership to user
    user.memberships = user.memberships || [];
    // Remove any existing membership for this channel before adding the new one
    user.memberships = user.memberships.filter(m => m.channelId !== tier.channelId);
    user.memberships.push({ channelId: tier.channelId, tierId: tier.id });
    
    const newTransaction = {
        id: uuidv4(),
        type: 'MEMBERSHIP',
        amount: tier.price,
        fromUserId: userId,
        toUserId: tier.channelId,
        tierId,
        timestamp: new Date().toISOString(),
    };

    db.data.transactions.push(newTransaction);
    await db.write();
    res.status(201).json(newTransaction);
};