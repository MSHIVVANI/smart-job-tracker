// backend/src/routes/authRoutes.js

import express from 'express';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

// These routes are public. No middleware is needed.
router.post('/register', register);
router.post('/login', login);

export default router;