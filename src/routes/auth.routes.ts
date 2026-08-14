import { Router } from 'express';
import {
  loginAdmin,
  logoutAdmin,
  getMe,
  changePassword,
  updateProfile,
  getAuditLogs,
} from '../controllers/auth.controller';
import {
  loginValidationSchema,
  changePasswordValidationSchema,
  updateProfileValidationSchema,
} from '../validators/auth.validator';
import { validate } from '../middleware/validate';
import { loginRateLimiter } from '../middleware/rateLimiter';
import { auth } from '../middleware/auth';

const router = Router();

// Login route with Rate Limiter & Zod Validation
router.post('/login', loginRateLimiter, validate(loginValidationSchema), loginAdmin);

// Logout route
router.post('/logout', auth, logoutAdmin);

// Get current admin status
router.get('/me', auth, getMe);

// Update profile route
router.put('/profile', auth, validate(updateProfileValidationSchema), updateProfile);

// Change password route
router.put('/change-password', auth, validate(changePasswordValidationSchema), changePassword);

// Get 3-day auth audit logs route
router.get('/logs', auth, getAuditLogs);

export default router;
