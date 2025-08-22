import express from 'express';
import { subscribe, cancel, getStatus } from '../controllers/premiumController.js';

const router = express.Router();

router.post('/subscribe', subscribe);
router.post('/cancel', cancel);
router.get('/:userId/status', getStatus);

export default router;