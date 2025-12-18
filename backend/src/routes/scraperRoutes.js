import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { findJobs } from '../controllers/scraperController.js';

const router = express.Router();
router.use(authMiddleware);
router.post('/jobs', findJobs);
export default router;