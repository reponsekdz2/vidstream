import { db } from '../../../db.js';
import { v4 as uuidv4 } from 'uuid';

export const getAllVideos = (req, res) => {
  const { q } = req.query;
  const videos = db.data.videos;
  if (q) {
    const searchQuery = q.toString().toLowerCase();
    const filteredVideos = videos.filter(video => 
      video.title.toLowerCase().includes(searchQuery) ||
      video.user.name.toLowerCase().includes(searchQuery) ||
      video.genre.toLowerCase().includes(searchQuery)
    );
    return res.json(filteredVideos);
  }
  res.json(videos);
};

export const getVideoById = (req, res) => {
  const { id } = req.params;
  const video = db.data.videos.find(v => v.id === id);
  if (video) {
    res.json(video);
  } else {
    res.status(404).json({ message: 'Video not found' });
  }
};

export const likeVideo = async (req, res) => {
    const { id } = req.params;
    const video = db.data.videos.find(v => v.id === id);
    if (video) {
        video.likes += 1;
        await db.write();
        res.status(200).json({ likes: video.likes });
    } else {
        res.status(404).json({ message: 'Video not found' });
    }
};

export const uploadVideo = async (req, res) => {
    const { userId, title, description, videoUrl, thumbnailUrl, genre } = req.body;
    
    if (!userId || !title || !description || !videoUrl || !thumbnailUrl || !genre) {
        return res.status(400).json({ message: 'All fields are required for upload.' });
    }
    
    const user = db.data.users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({ message: 'Uploading user not found.' });
    }

    const newVideo = {
        id: uuidv4(),
        userId: user.id,
        thumbnailUrl,
        videoUrl,
        videoPreviewUrl: videoUrl,
        title,
        duration: '0:00',
        user: {
            id: user.id,
            name: user.name,
            avatarUrl: user.avatarUrl,
            subscribers: user.subscribers,
        },
        views: '0 views',
        viewCount: 0,
        commentCount: 0,
        isLive: false,
        uploadedAt: 'Just now',
        description,
        genre,
        likes: 0,
    };

    db.data.videos.unshift(newVideo);
    await db.write();
    res.status(201).json(newVideo);
};