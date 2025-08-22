import express from 'express';
import { createClip } from '../controllers/clipController.js';

const router = express.Router();

// Note: Get clips is handled by /api/v1/videos/:id/clips
router.post('/', createClip);

export default router;