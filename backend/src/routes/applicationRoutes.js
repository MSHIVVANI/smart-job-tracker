import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { getApplications, createApplication, updateApplication, deleteApplication } from '../controllers/applicationController.js';

const router = express.Router();

// This line PROTECTS all routes in this file
router.use(authMiddleware);

router.get('/', getApplications);
router.post('/', createApplication);
router.put('/:id', updateApplication);
router.delete('/:id', deleteApplication);

export default router;