import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  register,
  login,
  googleAuth,
  googleAuthCallback,
  getGoogleAuthStatus 
} from '../controllers/authController.js';

const router = express.Router();

// --- Standard Authentication Routes (Public) ---
router.post('/register', register);
router.post('/login', login);

// --- Google OAuth2 Routes ---

// The route to START the Google login process.
// It is protected by middleware because we must know which user is connecting.
router.get('/google', authMiddleware, googleAuth);

// The route that Google REDIRECTS to after user consent.
// This is public as it's initiated by Google's servers.
router.get('/google/callback', googleAuthCallback);

// The new route to check the current connection status.
// This is protected because we need to check the status for the logged-in user.
router.get('/google/status', authMiddleware, getGoogleAuthStatus);

export default router;