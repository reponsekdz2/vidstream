import express from 'express';
import { requireAdmin } from '../../../middleware/authMiddleware.js';
import { 
    getSiteAnalytics, 
    getAllUsersAdmin, 
    deleteUserAdmin,
    getAllVideosAdmin,
    deleteVideoAdmin,
    getReports,
    resolveReport,
    searchComments,
    deleteCommentAdmin,
} from '../controllers/adminController.js';

const router = express.Router();

// All routes in this file are protected and require admin access
router.use(requireAdmin);

// Analytics
router.get('/analytics', getSiteAnalytics);

// User Management
router.get('/users', getAllUsersAdmin);
router.delete('/users/:userId', deleteUserAdmin);

// Video Management
router.get('/videos', getAllVideosAdmin);
router.delete('/videos/:videoId', deleteVideoAdmin);

// Moderation
router.get('/reports', getReports);
router.put('/reports/:reportId', resolveReport);
router.get('/comments/search', searchComments);
router.delete('/comments/:commentId', deleteCommentAdmin);


export default router;