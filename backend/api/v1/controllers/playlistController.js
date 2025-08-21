import { playlists } from '../../../../data/playlists.js';
import { videos } from '../../../../data/db.js';

export const getUserPlaylists = (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required.' });
    }
    const userPlaylists = playlists.filter(p => p.userId === userId);
    res.json(userPlaylists);
};

export const getPlaylistById = (req, res) => {
    const { id } = req.params;
    const playlist = playlists.find(p => p.id === id);
    if (playlist) {
        res.json(playlist);
    } else {
        res.status(404).json({ message: 'Playlist not found.' });
    }
};

export const createPlaylist = (req, res) => {
    const { userId, name, description, initialVideoId } = req.body;
    if (!userId || !name) {
        return res.status(400).json({ message: 'User ID and playlist name are required.' });
    }
    
    const newPlaylist = {
        id: `pl-${Date.now()}`,
        userId,
        name,
        description: description || '',
        videoIds: initialVideoId ? [initialVideoId] : [],
        thumbnailUrl: '',
    };
    
    if (initialVideoId) {
        const firstVideo = videos.find(v => v.id === initialVideoId);
        if (firstVideo) {
            newPlaylist.thumbnailUrl = firstVideo.thumbnailUrl;
        }
    }

    playlists.push(newPlaylist);
    res.status(201).json(newPlaylist);
};

export const toggleVideoInPlaylist = (req, res) => {
    const { id: playlistId } = req.params;
    const { videoId } = req.body;

    const playlistIndex = playlists.findIndex(p => p.id === playlistId);
    if (playlistIndex === -1) {
        return res.status(404).json({ message: 'Playlist not found.' });
    }
    
    const playlist = playlists[playlistIndex];
    const videoExists = playlist.videoIds.includes(videoId);

    if (videoExists) {
        playlist.videoIds = playlist.videoIds.filter(id => id !== videoId);
    } else {
        playlist.videoIds.push(videoId);
    }

    // Update thumbnail if necessary
    if (playlist.videoIds.length > 0) {
        const firstVideo = videos.find(v => v.id === playlist.videoIds[0]);
        playlist.thumbnailUrl = firstVideo ? firstVideo.thumbnailUrl : '';
    } else {
        playlist.thumbnailUrl = '';
    }

    res.status(200).json(playlist);
};
