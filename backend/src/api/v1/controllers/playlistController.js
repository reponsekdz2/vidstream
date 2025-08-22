import { db } from '../../../db.js';
import { v4 as uuidv4 } from 'uuid';

export const getUserPlaylists = (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required.' });
    }
    const userPlaylists = db.data.playlists.filter(p => p.userId === userId);
    res.json(userPlaylists);
};

export const getPlaylistById = (req, res) => {
    const { id } = req.params;
    const playlist = db.data.playlists.find(p => p.id === id);
    if (playlist) {
        res.json(playlist);
    } else {
        res.status(404).json({ message: 'Playlist not found.' });
    }
};

export const createPlaylist = async (req, res) => {
    const { userId, name, description, initialVideoId } = req.body;
    if (!userId || !name) {
        return res.status(400).json({ message: 'User ID and playlist name are required.' });
    }
    
    const newPlaylist = {
        id: uuidv4(),
        userId,
        name,
        description: description || '',
        videoIds: initialVideoId ? [initialVideoId] : [],
        thumbnailUrl: '',
    };
    
    if (initialVideoId) {
        const firstVideo = db.data.videos.find(v => v.id === initialVideoId);
        if (firstVideo) {
            newPlaylist.thumbnailUrl = firstVideo.thumbnailUrl;
        }
    }

    db.data.playlists.push(newPlaylist);
    await db.write();
    res.status(201).json(newPlaylist);
};

export const toggleVideoInPlaylist = async (req, res) => {
    const { id: playlistId } = req.params;
    const { videoId } = req.body;

    const playlist = db.data.playlists.find(p => p.id === playlistId);
    if (!playlist) {
        return res.status(404).json({ message: 'Playlist not found.' });
    }
    
    const videoExists = playlist.videoIds.includes(videoId);

    if (videoExists) {
        playlist.videoIds = playlist.videoIds.filter(id => id !== videoId);
    } else {
        playlist.videoIds.push(videoId);
    }

    // Update thumbnail if necessary
    if (playlist.videoIds.length > 0) {
        const firstVideo = db.data.videos.find(v => v.id === playlist.videoIds[0]);
        playlist.thumbnailUrl = firstVideo ? firstVideo.thumbnailUrl : '';
    } else {
        playlist.thumbnailUrl = '';
    }
    
    await db.write();
    res.status(200).json(playlist);
};

export const reorderPlaylist = async (req, res) => {
    const { id: playlistId } = req.params;
    const { videoIds } = req.body;

    const playlist = db.data.playlists.find(p => p.id === playlistId);
    if (!playlist) {
        return res.status(404).json({ message: 'Playlist not found.' });
    }

    // Basic validation to ensure all video IDs are strings
    if (!Array.isArray(videoIds) || !videoIds.every(id => typeof id === 'string')) {
        return res.status(400).json({ message: 'Invalid videoIds format.' });
    }

    playlist.videoIds = videoIds;

    await db.write();
    res.status(200).json(playlist);
};