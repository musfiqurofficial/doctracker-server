import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/doctor_tracker',
  JWT_SECRET: process.env.JWT_SECRET || 'doctor_tracker_super_secret_key_12345',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@doctracker.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'AdminSecretPassword123!',
  RATE_LIMIT_WINDOW_MINS: Number(process.env.RATE_LIMIT_WINDOW_MINS) || 5,
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX) || 5,
};
