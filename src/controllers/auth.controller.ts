import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin';
import { AuditLog } from '../models/AuditLog';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';

export const loginAdmin = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const remaining = req.rateLimit ? req.rateLimit.remaining : env.RATE_LIMIT_MAX - 1;

  // Find admin with password
  const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
  if (!admin || !admin.password) {
    throw new ApiError(
      401,
      `Invalid credentials. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining out of ${env.RATE_LIMIT_MAX}.`
    );
  }

  // Compare bcrypt password
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    throw new ApiError(
      401,
      `Invalid credentials. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining out of ${env.RATE_LIMIT_MAX}.`
    );
  }

  // Record LOGIN event in AuditLog
  const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown Browser/Device';

  await AuditLog.create({
    action: 'LOGIN',
    adminId: admin._id,
    email: admin.email,
    ipAddress,
    userAgent,
    timestamp: new Date(),
  });

  // Issue JWT Token
  const token = jwt.sign(
    { id: admin._id, email: admin.email },
    env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  // Set httpOnly Cookie
  const isProduction = env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Admin authenticated successfully',
    data: {
      email: admin.email,
    },
  });
});

export const logoutAdmin = catchAsync(async (req: Request, res: Response) => {
  const isProduction = env.NODE_ENV === 'production';

  // Record LOGOUT event in AuditLog
  const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown Browser/Device';

  if (req.user) {
    await AuditLog.create({
      action: 'LOGOUT',
      adminId: req.user.id,
      email: req.user.email,
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });
  }

  res.cookie('token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    expires: new Date(0), // Instantly expire cookie
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Logged out successfully',
  });
});

export const getMe = catchAsync(async (req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Authenticated admin profile retrieved',
    data: {
      id: req.user?.id,
      email: req.user?.email,
    },
  });
});

export const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const adminId = req.user?.id;

  const admin = await Admin.findById(adminId).select('+password');
  if (!admin || !admin.password) {
    throw new ApiError(404, 'Admin account not found');
  }

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, admin.password);
  if (!isMatch) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  // Hash new password and save
  const salt = await bcrypt.genSalt(10);
  admin.password = await bcrypt.hash(newPassword, salt);
  await admin.save();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password changed successfully',
  });
});

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const adminId = req.user?.id;

  if (email) {
    const existing = await Admin.findOne({ email: email.toLowerCase(), _id: { $ne: adminId } });
    if (existing) {
      throw new ApiError(400, 'Email address is already in use by another admin');
    }
  }

  const updatedAdmin = await Admin.findByIdAndUpdate(
    adminId,
    { ...(email && { email: email.toLowerCase() }) },
    { new: true }
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile updated successfully',
    data: {
      email: updatedAdmin?.email,
    },
  });
});

export const getAuditLogs = catchAsync(async (req: Request, res: Response) => {
  // Query logs from the last 3 days
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  const logs = await AuditLog.find({
    timestamp: { $gte: threeDaysAgo },
  })
    .sort({ timestamp: -1 })
    .limit(100);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Last 3 days auth activity audit logs retrieved',
    data: logs,
  });
});
