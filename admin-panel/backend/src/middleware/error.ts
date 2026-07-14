import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error caught by global handler:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    status: 'error',
    statusCode: status,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
