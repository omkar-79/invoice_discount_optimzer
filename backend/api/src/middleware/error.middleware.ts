import { Request, Response, NextFunction } from 'express';
import logger from './logger.middleware';

export class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(err);

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    
    // Unique constraint violation (PostgreSQL)
    if (prismaError.code === 'P2002') {
      const message = 'A record with this information already exists';
      error = { message, statusCode: 409 } as AppError;
    }
    
    // Record not found
    else if (prismaError.code === 'P2025') {
      const message = 'Record not found';
      error = { message, statusCode: 404 } as AppError;
    }
    
    // Foreign key constraint violation
    else if (prismaError.code === 'P2003') {
      const message = 'Invalid reference to related record';
      error = { message, statusCode: 400 } as AppError;
    }
    
    // Required field violation
    else if (prismaError.code === 'P2000') {
      const message = 'Invalid data provided';
      error = { message, statusCode: 400 } as AppError;
    }
    
    // Connection error
    else if (prismaError.code === 'P1001') {
      const message = 'Database connection failed';
      error = { message, statusCode: 503 } as AppError;
    }
    
    // Generic Prisma error
    else {
      const message = 'Database operation failed';
      error = { message, statusCode: 500 } as AppError;
    }
  }

  // Prisma validation errors
  if (err.name === 'PrismaClientValidationError') {
    const message = 'Invalid data provided';
    error = { message, statusCode: 400 } as AppError;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 } as AppError;
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 } as AppError;
  }

  // Validation errors (from express-validator or other validation libraries)
  if (err.name === 'ValidationError') {
    const message = 'Invalid input data';
    error = { message, statusCode: 400 } as AppError;
  }

  // Syntax errors (malformed JSON, etc.)
  if (err.name === 'SyntaxError') {
    const message = 'Invalid request format';
    error = { message, statusCode: 400 } as AppError;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};
