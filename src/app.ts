import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import routes from './routes';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();

// Parsers & Security Middleware
app.use(
  cors({
    origin: [env.CLIENT_URL, 'http://localhost:3000'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Doctor Tracker Backend API Server',
  });
});

// API Routes
app.use('/api', routes);
app.use('/api/v1', routes);

// 404 Not Found Handler
app.use(notFound);

// Central Global Error Handler
app.use(errorHandler);

export default app;
