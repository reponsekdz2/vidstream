import express from 'express';
import { getAllVideos, getVideoById, likeVideo, uploadVideo } from '../controllers/videoController.js';

const router = express.Router();

router.get('/', getAllVideos);
router.post('/', uploadVideo);
router.get('/:id', getVideoById);
router.post('/:id/like', likeVideo);


export default router;