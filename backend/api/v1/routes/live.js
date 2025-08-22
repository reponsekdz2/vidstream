import express from 'express';
import { getAllLive, getLiveChat, startLiveStream, stopLiveStream } from '../controllers/liveController.js';

const router = express.Router();

router.get('/', getAllLive);
router.post('/start', startLiveStream);
router.post('/:videoId/stop', stopLiveStream);
router.get('/:videoId/chat', getLiveChat);

export default router;