import express from 'express';
import { 
    getChannelLayout, 
    updateChannelLayout,
    getCommunityPosts,
    createCommunityPost,
    voteOnPoll,
    updateModeration
} from '../controllers/channelController.js';

const router = express.Router();

// Channel Layout
router.get('/:id/layout', getChannelLayout);
router.put('/:id/layout', updateChannelLayout);

// Community Posts
router.get('/:id/community', getCommunityPosts);
router.post('/:id/community', createCommunityPost);
router.post('/:id/community/:postId/vote', voteOnPoll);

// Moderation
router.put('/:id/moderation', updateModeration);

export default router;