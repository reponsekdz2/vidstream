import express from 'express';
import { getUserById, getUserVideos, toggleSubscription, getUserSubscriptions } from '../controllers/userController.js';

const router = express.Router();

router.post('/subscribe', toggleSubscription);
router.get('/:id', getUserById);
router.get('/:id/videos', getUserVideos);
router.get('/:id/subscriptions', getUserSubscriptions);


export default router;