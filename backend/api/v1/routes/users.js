import express from 'express';
import { getUserById, getUserVideos, toggleSubscription, getUserSubscriptions, updateUserProfile } from '../controllers/userController.js';

const router = express.Router();

router.post('/subscribe', toggleSubscription);
router.get('/:id', getUserById);
router.put('/:id', updateUserProfile); // Added route for updating user profile
router.get('/:id/videos', getUserVideos);
router.get('/:id/subscriptions', getUserSubscriptions);


export default router;