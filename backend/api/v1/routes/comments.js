import express from 'express';
import { getCommentsForVideo, postComment, postReply, getReplies } from '../controllers/commentController.js';

const router = express.Router();

// Routes for top-level comments on a video
router.get('/video/:videoId', getCommentsForVideo);
router.post('/video/:videoId', postComment);

// Routes for replies to a comment
router.get('/:commentId/replies', getReplies);
router.post('/:commentId/replies', postReply);

export default router;