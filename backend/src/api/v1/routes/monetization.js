import express from 'express';
import { 
    createSuperThanks, 
    getChannelTiers,
    createMembershipTier,
    updateMembershipTier,
    deleteMembershipTier,
    subscribeToTier
} from '../controllers/monetizationController.js';

const router = express.Router();

// Super Thanks
router.post('/super-thanks', createSuperThanks);

// Membership Tiers
router.get('/:channelId/memberships', getChannelTiers);
router.post('/:channelId/memberships', createMembershipTier);
router.put('/memberships/:tierId', updateMembershipTier);
router.delete('/memberships/:tierId', deleteMembershipTier);

// User subscribing to a tier
router.post('/subscribe-membership', subscribeToTier);

export default router;