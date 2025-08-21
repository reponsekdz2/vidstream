import { videos } from '../../../../data/db.js';
import { users } from '../../../../data/users.js';

export const getAllVideos = (req, res) => {
  const { q } = req.query;
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
  const video = videos.find(v => v.id === id);
  if (video) {
    res.json(video);
  } else {
    res.status(404).json({ message: 'Video not found' });
  }
};

export const likeVideo = (req, res) => {
    const { id } = req.params;
    const video = videos.find(v => v.id === id);
    if (video) {
        video.likes += 1;
        res.status(200).json({ likes: video.likes });
    } else {
        res.status(404).json({ message: 'Video not found' });
    }
};

export const uploadVideo = (req, res) => {
    const { userId, title, description, videoUrl, thumbnailUrl, genre } = req.body;
    
    if (!userId || !title || !description || !videoUrl || !thumbnailUrl || !genre) {
        return res.status(400).json({ message: 'All fields are required for upload.' });
    }
    
    const user = users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({ message: 'Uploading user not found.' });
    }

    const newVideo = {
        id: `vid-${Date.now()}`,
        userId: user.id,
        thumbnailUrl,
        videoUrl,
        videoPreviewUrl: videoUrl, // Use main video for preview in this mock
        title,
        duration: '0:00', // Placeholder
        user: {
            id: user.id,
            name: user.name,
            avatarUrl: user.avatarUrl,
            subscribers: user.subscribers.toLocaleString(),
        },
        views: '0 views',
        uploadedAt: 'Just now',
        description,
        genre,
        likes: 0,
    };

    videos.unshift(newVideo); // Add to the beginning of the list
    res.status(201).json(newVideo);
};