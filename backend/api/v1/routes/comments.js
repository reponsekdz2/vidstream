import express from 'express';
import { getComments, postComment } from '../controllers/commentController.js';

const router = express.Router();

// Routes are relative to /api/v1/videos
router.get('/:videoId/comments', getComments);
router.post('/:videoId/comments', postComment);

export default router;