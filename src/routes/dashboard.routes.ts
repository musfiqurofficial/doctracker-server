import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { auth } from '../middleware/auth';

const router = Router();

// Protected dashboard analytics endpoint
router.get('/stats', auth, getDashboardStats);

export default router;
