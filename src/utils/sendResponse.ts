import { Response } from 'express';

export interface IApiResponse<T> {
  success: boolean;
  statusCode: number;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPage?: number;
    totalPages?: number;
  };
  data?: T;
}

export const sendResponse = <T>(res: Response, data: IApiResponse<T>): void => {
  res.status(data.statusCode).json({
    success: data.success,
    statusCode: data.statusCode,
    message: data.message || null,
    meta: data.meta ? {
      ...data.meta,
      totalPage: data.meta.totalPage || data.meta.totalPages,
      totalPages: data.meta.totalPages || data.meta.totalPage,
    } : undefined,
    data: data.data || null,
  });
};
