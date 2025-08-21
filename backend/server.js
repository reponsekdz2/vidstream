import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import bodyParser from 'body-parser';

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
import channelRoutes from './api/v1/routes/channels.js';
import creatorRoutes from './api/v1/routes/creator.js';
import monetizationRoutes from './api/v1/routes/monetization.js';
import premiumRoutes from './api/v1/routes/premium.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/videos', videoRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/playlists', playlistRoutes);
app.use('/api/v1/history', historyRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/live', liveRoutes);
app.use('/api/v1/channels', channelRoutes);
app.use('/api/v1/creator', creatorRoutes);
app.use('/api/v1/monetization', monetizationRoutes);
app.use('/api/v1/premium', premiumRoutes);


// A simple catch-all for old, non-versioned routes for graceful degradation
app.get('/api/shorts', (req, res) => {
    res.json(db.data.shorts); 
});
app.get('/api/v1/videos/:videoId/comments', (req, res, next) => {
    // This is a legacy route now handled by /api/v1/comments
    // Redirect or proxy if needed, for now we let the new one handle it.
    next();
});


app.listen(port, async () => {
  await db.read(); // Read the database on server start
  console.log(`Backend server listening at http://localhost:${port}`);
});