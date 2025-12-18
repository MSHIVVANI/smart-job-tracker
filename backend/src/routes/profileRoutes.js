// backend/src/routes/profileRoutes.js

import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { getProfile, updateProfile } from '../controllers/profileController.js';

const router = express.Router();

// Protect all routes in this file. Only logged-in users can access their profile.
router.use(authMiddleware);

// GET /api/profile
router.get('/', getProfile);

// PUT /api/profile
router.put('/', updateProfile);

export default router;