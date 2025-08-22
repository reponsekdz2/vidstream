import express from 'express';
import { getMerchForChannel } from '../controllers/storeController.js';

const router = express.Router();

router.get('/:channelId', getMerchForChannel);

export default router;