import { db } from '../../../db.js';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';

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
    // Check for premiere status
    const premiere = db.data.premieres.find(p => p.videoId === id);
    if (premiere) {
        video.premiereTime = premiere.premiereTime;
    }
    res.json(video);
  } else {
    res.status(404).json({ message: 'Video not found' });
  }
};

export const getPopularVideos = (req, res) => {
  const { userId } = req.params;
  const userVideos = db.data.videos.filter(v => v.userId === userId);
  const popularVideos = [...userVideos].sort((a,b) => b.viewCount - a.viewCount).slice(0, 10);
  res.json(popularVideos);
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
    const { userId, title, description, genre } = req.body;
    const videoFile = req.files?.videoFile?.[0];
    const thumbnailFile = req.files?.thumbnailFile?.[0];
    
    if (!userId || !title || !description || !genre || !videoFile || !thumbnailFile) {
        return res.status(400).json({ message: 'All fields and files are required for upload.' });
    }
    
    const user = db.data.users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({ message: 'Uploading user not found.' });
    }

    const videoUrl = `/uploads/${videoFile.filename}`;
    const thumbnailUrl = `/uploads/${thumbnailFile.filename}`;

    const newVideo = {
        id: uuidv4(),
        userId: user.id,
        thumbnailUrl,
        videoUrl,
        videoPreviewUrl: videoUrl,
        title,
        duration: '0:00', // This would ideally be extracted from the video file on the backend
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

export const schedulePremiere = async (req, res) => {
    const { id: videoId } = req.params;
    const { minutesFromNow } = req.body; // e.g., 5

    const video = db.data.videos.find(v => v.id === videoId);
    if (!video) {
        return res.status(404).json({ message: 'Video not found.' });
    }

    const premiereTime = add(new Date(), { minutes: minutesFromNow });
    
    const newPremiere = {
        videoId,
        premiereTime: premiereTime.toISOString(),
    };
    
    // Remove existing premiere for this video if it exists
    db.data.premieres = db.data.premieres.filter(p => p.videoId !== videoId);
    db.data.premieres.push(newPremiere);
    
    await db.write();
    
    res.status(201).json({ ...video, premiereTime: newPremiere.premiereTime });
};