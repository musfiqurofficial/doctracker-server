import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { connectDB } from './config/database';
import routes from './routes';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin === env.CLIENT_URL ||
        origin.includes('localhost') ||
        origin.endsWith('.vercel.app')
      ) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Doctor Tracker Backend API Server',
    version: '1.0.0',
    status: 'operational',
    health: '/api/v1/health',
    endpoints: {
      seed: '/api/v1/seed',
      auth: '/api/v1/auth',
      doctors: '/api/v1/doctors',
      patients: '/api/v1/patients',
      dashboard: '/api/v1/dashboard/stats',
    },
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', routes);
app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
