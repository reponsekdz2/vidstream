import express from 'express';
import { getTrending, getCreatorDashboard } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/trending', getTrending);
router.get('/creator/:userId', getCreatorDashboard);

export default router;