import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

export const loginRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MINS * 60 * 1000, // Dynamic minutes window from env
  max: env.RATE_LIMIT_MAX, // Dynamic max attempts from env
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    const resetTime = req.rateLimit?.resetTime;
    const retryAfterMs = resetTime ? Math.max(0, resetTime.getTime() - Date.now()) : env.RATE_LIMIT_WINDOW_MINS * 60 * 1000;
    const retryAfterMins = Math.ceil(retryAfterMs / (60 * 1000));

    res.status(429).json({
      success: false,
      statusCode: 429,
      message: `Too many failed login attempts. Account temporarily locked for ${retryAfterMins} minute(s).`,
      error: 'RateLimitExceeded',
      retryAfterMs,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    });
  },
});
