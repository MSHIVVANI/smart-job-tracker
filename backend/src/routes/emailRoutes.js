import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { triggerScan } from '../controllers/emailController.js';

const router = express.Router();
router.use(authMiddleware);

// POST /api/email/scan
router.post('/scan', triggerScan);

export default router;