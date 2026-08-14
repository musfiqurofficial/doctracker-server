import mongoose from 'mongoose';
import { env } from './env';

let isConnected = false;

export async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const db = await mongoose.connect(env.DATABASE_URL);
    isConnected = db.connections[0].readyState === 1;
    console.log('[MongoDB] Connected successfully to database');
  } catch (error) {
    console.error('[MongoDB] Connection error:', error);
    throw error;
  }
}
