import express from 'express';
import multer from 'multer';
import authMiddleware from '../middleware/authMiddleware.js';
import { getProfile, updateProfile, parseResume } from '../controllers/profileController.js';

const router = express.Router();

// Memory storage is best for small PDF files
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

router.use(authMiddleware);

router.get('/', getProfile);
router.put('/', updateProfile);

// Route with pre-controller logging
router.post('/upload', (req, res, next) => {
  console.log('📬 [ROUTER]: Incoming request to /api/profile/upload');
  next();
}, upload.single('resume'), parseResume);

export default router;