import express from 'express';
import { getAllLive, getLiveChat } from '../controllers/liveController.js';

const router = express.Router();

router.get('/', getAllLive);
router.get('/:videoId/chat', getLiveChat);

export default router;