import express from 'express';
import { getUserPlaylists, getPlaylistById, createPlaylist, toggleVideoInPlaylist } from '../controllers/playlistController.js';

const router = express.Router();

router.get('/', getUserPlaylists);
router.post('/', createPlaylist);
router.get('/:id', getPlaylistById);
router.post('/:id/videos', toggleVideoInPlaylist);

export default router;