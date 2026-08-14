import { Request, Response } from 'express';

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `API Route Not Found: ${req.originalUrl}`,
    error: 'NotFound',
  });
};
