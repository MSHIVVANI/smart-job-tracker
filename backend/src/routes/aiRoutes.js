import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { suggestBulletPoints, classifyEmail, findRelevantApplication } from '../controllers/aiController.js';

const router = express.Router();
router.use(authMiddleware);

router.post('/suggest-bullets', suggestBulletPoints);
router.post('/classify-email', classifyEmail);
router.post('/find-relevant-app', findRelevantApplication); // <-- NEW RELEVANCE ROUTE

export default router;