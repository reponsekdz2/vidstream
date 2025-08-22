import express from 'express';

// Import all V1 route modules
import adminRoutes from './v1/routes/admin.js';
import analyticsRoutes from './v1/routes/analytics.js';
import authRoutes from './v1/routes/auth.js';
import channelRoutes from './v1/routes/channels.js';
import clipRoutes from './v1/routes/clips.js';
import commentRoutes from './v1/routes/comments.js';
import creatorRoutes from './v1/routes/creator.js';
import historyRoutes from './v1/routes/history.js';
import liveRoutes from './v1/routes/live.js';
import monetizationRoutes from './v1/routes/monetization.js';
import notificationRoutes from './v1/routes/notifications.js';
import playlistRoutes from './v1/routes/playlists.js';
import premiumRoutes from './v1/routes/premium.js';
import storeRoutes from './v1/routes/store.js';
import userRoutes from './v1/routes/users.js';
import videoRoutes from './v1/routes/videos.js';

const router = express.Router();
const v1Router = express.Router();

// Mount all v1 routes onto the v1Router
v1Router.use('/admin', adminRoutes);
v1Router.use('/analytics', analyticsRoutes);
v1Router.use('/auth', authRoutes);
v1Router.use('/channels', channelRoutes);
v1Router.use('/clips', clipRoutes);
v1Router.use('/comments', commentRoutes);
v1Router.use('/creator', creatorRoutes);
v1Router.use('/history', historyRoutes);
v1Router.use('/live', liveRoutes);
v1Router.use('/monetization', monetizationRoutes);
v1Router.use('/notifications', notificationRoutes);
v1Router.use('/playlists', playlistRoutes);
v1Router.use('/premium', premiumRoutes);
v1Router.use('/store', storeRoutes);
v1Router.use('/users', userRoutes);
v1Router.use('/videos', videoRoutes);

// Mount the versioned router onto the main API router
router.use('/v1', v1Router);

export default router;
