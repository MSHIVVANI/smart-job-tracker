import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { suggestBulletPoints, classifyEmail } from '../controllers/aiController.js';

const router = express.Router();
router.use(authMiddleware);
router.post('/suggest-bullets', suggestBulletPoints);
router.post('/classify-email', classifyEmail);

export default router;