import express from 'express';
import { getMonetizationData } from '../controllers/creatorController.js';

const router = express.Router();

router.get('/:id/monetization', getMonetizationData);

export default router;