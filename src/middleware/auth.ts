import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { Admin } from '../models/Admin';
import { catchAsync } from '../utils/catchAsync';

export interface JwtPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const auth = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Extract token from httpOnly cookie or Authorization header
  let token = req.cookies?.token;

  if (!token && req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Unauthorized access. Token is missing or invalid.');
  }

  // Verify JWT token
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // Check if admin still exists in database
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      throw new ApiError(401, 'Admin account associated with this token no longer exists.');
    }

    req.user = decoded;
    next();
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired authentication token.');
  }
});
