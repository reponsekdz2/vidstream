import { db } from '../../../db.js';
import { v4 as uuidv4 } from 'uuid';
import { add, subHours, subDays, subWeeks, subMonths, subYears, parseISO, isAfter } from 'date-fns';
import { processVideo } from '../../../services/ffmpegService.js';
import fs from 'fs';
import path from 'path';

export const getAllVideos = (req, res) => {
  const { q, limit } = req.query;
  let videos = [...db.data.videos];

  if (q) {
    const searchQuery = q.toString().toLowerCase();
    videos = videos.filter(video => 
      video.title.toLowerCase().includes(searchQuery) ||
      video.user.name.toLowerCase().includes(searchQuery) ||
      video.genre.toLowerCase().includes(searchQuery)
    );
  }

  if (limit) {
      videos = videos.slice(0, parseInt(limit.toString(), 10));
  }

  res.json(videos);
};

export const searchVideos = (req, res) => {
    const { q, uploadDate, duration, sortBy } = req.query;
    let videos = [...db.data.videos];
    
    // 1. Filter by query
    if (q) {
        const searchQuery = q.toString().toLowerCase();
        videos = videos.filter(video => 
          video.title.toLowerCase().includes(searchQuery) ||
          video.user.name.toLowerCase().includes(searchQuery) ||
          video.genre.toLowerCase().includes(searchQuery)
        );
    }

    // 2. Filter by upload date
    if (uploadDate && uploadDate !== 'any') {
        const now = new Date();
        let startDate;
        if (uploadDate === 'hour') startDate = subHours(now, 1);
        else if (uploadDate === 'today') startDate = subDays(now, 1);
        else if (uploadDate === 'week') startDate = subWeeks(now, 1);
        else if (uploadDate === 'month') startDate = subMonths(now, 1);
        else if (uploadDate === 'year') startDate = subYears(now, 1);

        if (startDate) {
            videos = videos.filter(video => isAfter(parseISO(video.uploadDate), startDate));
        }
    }

    // 3. Filter by duration
    if (duration && duration !== 'any') {
        if (duration === 'short') { // Under 4 minutes
            videos = videos.filter(v => v.durationSeconds < 240);
        } else if (duration === 'medium') { // 4-20 minutes
            videos = videos.filter(v => v.durationSeconds >= 240 && v.durationSeconds <= 1200);
        } else if (duration === 'long') { // Over 20 minutes
            videos = videos.filter(v => v.durationSeconds > 1200);
        }
    }

    // 4. Sort results
    if (sortBy === 'date') {
        videos.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    } else if (sortBy === 'views') {
        videos.sort((a, b) => b.viewCount - a.viewCount);
    }
    // 'relevance' is the default and is approximated by the initial state

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

export const getTranscript = (req, res) => {
    const { id } = req.params;
    const transcriptPath = path.join('uploads', 'transcripts', `${id}.vtt`);
    
    if (fs.existsSync(transcriptPath)) {
      const vttContent = fs.readFileSync(transcriptPath, 'utf-8');
      // Simple VTT parser
      const lines = vttContent.split('\n');
      const transcript = [];
      for(let i=0; i < lines.length; i++) {
          if (lines[i].includes('-->')) {
              const timeMatch = lines[i].match(/(\d{2}:\d{2}\.\d{3})/);
              if (timeMatch) {
                  const timeParts = timeMatch[1].split(':');
                  const seconds = parseInt(timeParts[0], 10) * 60 + parseFloat(timeParts[1]);
                  const text = lines[i+1];
                  if(text) transcript.push({ time: seconds, text });
              }
          }
      }
      res.json(transcript);
    } else {
      res.json([]);
    }
};

export const getClipsForVideo = (req, res) => {
    const { id } = req.params;
    const clips = db.data.clips.filter(c => c.videoId === id);
    res.json(clips);
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

export const uploadVideo = async (req, res, next) => {
    const { userId, title, description, genre, chapters: chaptersText, visibility } = req.body;
    const videoFile = req.files?.videoFile?.[0];
    const transcriptFile = req.files?.transcriptFile?.[0];
    
    if (!userId || !title || !description || !genre || !videoFile) {
        return res.status(400).json({ message: 'All fields and video file are required.' });
    }
    
    const user = db.data.users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({ message: 'Uploading user not found.' });
    }

    try {
        const videoId = uuidv4();
        
        // This simulates a background job. In a real app, you'd send this to a queue.
        processVideo(videoFile.path, videoId)
            .then(async ({ thumbnailUrl, sources, duration, durationSeconds }) => {
                
                if (transcriptFile) {
                  const transcriptDir = path.join('uploads', 'transcripts');
                  if (!fs.existsSync(transcriptDir)) {
                      fs.mkdirSync(transcriptDir, { recursive: true });
                  }
                  const transcriptDest = path.join(transcriptDir, `${videoId}.vtt`);
                  fs.renameSync(transcriptFile.path, transcriptDest);
                }

                const chapters = [];
                if (chaptersText) {
                    const lines = chaptersText.split('\n').filter(line => line.trim() !== '');
                    for (const line of lines) {
                        const match = line.match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s*-\s*(.+)$/);
                        if (match) {
                            const timeStr = match[1];
                            const chapterTitle = match[2].trim();
                            const parts = timeStr.split(':').map(Number);
                            let timeInSeconds = 0;
                            if (parts.length === 3) {
                                timeInSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
                            } else {
                                timeInSeconds = parts[0] * 60 + parts[1];
                            }
                            chapters.push({ time: timeInSeconds, title: chapterTitle });
                        }
                    }
                }

                const newVideo = {
                    id: videoId,
                    userId: user.id,
                    thumbnailUrl,
                    sources,
                    videoUrl: sources['1080p'], // Default
                    videoPreviewUrl: sources['360p'], // Use low-res for preview
                    title,
                    duration,
                    durationSeconds,
                    user: { id: user.id, name: user.name, avatarUrl: user.avatarUrl, subscribers: user.subscribers },
                    views: '0 views',
                    viewCount: 0,
                    commentCount: 0,
                    isLive: false,
                    uploadedAt: 'Just now',
                    uploadDate: new Date().toISOString(),
                    description,
                    genre,
                    likes: 0,
                    chapters,
                    visibility: visibility || 'public',
                };
                
                db.data.videos.unshift(newVideo);
                await db.write();

                // Don't send a response here, as it's a background process.
                // The client will get the initial 201 and then wait.
                console.log(`Video ${videoId} processed successfully.`);

            })
            .catch(err => {
                console.error(`Failed to process video ${videoId}:`, err);
                // In a real app, you'd have a mechanism to report this failure.
            });
        
        // Respond immediately to the client
        res.status(201).json({ id: videoId, message: 'Upload received, processing started.' });

    } catch (err) {
        console.error("Upload failed:", err);
        // Pass to the centralized error handler
        next(err);
    }
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
    
    db.data.premieres = db.data.premieres.filter(p => p.videoId !== videoId);
    db.data.premieres.push(newPremiere);
    
    await db.write();
    
    res.status(201).json({ ...video, premiereTime: newPremiere.premiereTime });
};

export const reportVideo = async (req, res) => {
    const { id: videoId } = req.params;
    const { reporterId, reason } = req.body;

    if (!reporterId || !reason) {
        return res.status(400).json({ message: 'Reporter ID and reason are required.' });
    }

    const newReport = {
        id: uuidv4(),
        contentType: 'video',
        contentId: videoId,
        reporterId,
        reason,
        timestamp: new Date().toISOString(),
        status: 'pending',
    };

    db.data.reports.push(newReport);
    await db.write();

    res.status(201).json({ message: 'Video reported successfully.' });
};