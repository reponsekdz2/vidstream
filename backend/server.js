import express from 'express';
import cors from 'cors';
import { db } from './db.js';

// Import v1 API routes
import authRoutes from './api/v1/routes/auth.js';
import videoRoutes from './api/v1/routes/videos.js';
import userRoutes from './api/v1/routes/users.js';
import commentRoutes from './api/v1/routes/comments.js';
import playlistRoutes from './api/v1/routes/playlists.js';
import historyRoutes from './api/v1/routes/history.js';
import notificationRoutes from './api/v1/routes/notifications.js';
import analyticsRoutes from './api/v1/routes/analytics.js';
import liveRoutes from './api/v1/routes/live.js';

const app = express();
const port = 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/videos', videoRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/videos', commentRoutes); // e.g. /api/v1/videos/:videoId/comments
app.use('/api/v1/playlists', playlistRoutes);
app.use('/api/v1/history', historyRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/live', liveRoutes);


// A simple catch-all for old, non-versioned routes for graceful degradation
app.get('/api/shorts', (req, res) => {
    res.json(db.data.shorts); 
});


app.listen(port, async () => {
  await db.read(); // Read the database on server start
  console.log(`Backend server listening at http://localhost:${port}`);
});