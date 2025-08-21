import express from 'express';
import { getUserById, getUserVideos, toggleSubscription, getUserSubscriptions, updateUserProfile, getUserSettings, updateUserSettings } from '../controllers/userController.js';
import upload from '../../../middleware/upload.js';

const router = express.Router();

const profileUploadFields = [
    { name: 'avatar', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
];

router.post('/subscribe', toggleSubscription);
router.get('/:id', getUserById);
router.put('/:id', upload.fields(profileUploadFields), updateUserProfile);
router.get('/:id/videos', getUserVideos);
router.get('/:id/subscriptions', getUserSubscriptions);

// Advanced Settings Routes
router.get('/:id/settings', getUserSettings);
router.put('/:id/settings', updateUserSettings);


export default router;