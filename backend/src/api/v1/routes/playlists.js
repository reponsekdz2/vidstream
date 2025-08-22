import express from 'express';
import { getUserPlaylists, getPlaylistById, createPlaylist, toggleVideoInPlaylist, reorderPlaylist } from '../controllers/playlistController.js';

const router = express.Router();

router.get('/', getUserPlaylists);
router.post('/', createPlaylist);
router.get('/:id', getPlaylistById);
router.post('/:id/videos', toggleVideoInPlaylist);
router.put('/:id/reorder', reorderPlaylist);

export default router;