import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { suggestBulletPoints } from '../controllers/aiController.js';

const router = express.Router();
router.use(authMiddleware);
router.post('/suggest-bullets', suggestBulletPoints);
export default router;