import express from 'express';
import { getAllVideos, getVideoById, likeVideo, uploadVideo, getPopularVideos, schedulePremiere, reportVideo } from '../controllers/videoController.js';
import upload from '../../../middleware/upload.js';

const router = express.Router();

const videoUploadFields = [
    { name: 'videoFile', maxCount: 1 },
    { name: 'thumbnailFile', maxCount: 1 }
];

router.get('/', getAllVideos);
router.post('/', upload.fields(videoUploadFields), uploadVideo);
router.get('/popular/:userId', getPopularVideos);
router.get('/:id', getVideoById);
router.post('/:id/like', likeVideo);
router.post('/:id/premiere', schedulePremiere);
router.post('/:id/report', reportVideo);


export default router;