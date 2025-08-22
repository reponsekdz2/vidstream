import express from 'express';
import { getUserHistory, addToHistory } from '../controllers/historyController.js';

const router = express.Router();

router.get('/', getUserHistory);
router.post('/', addToHistory);

export default router;