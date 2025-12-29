import { Request, Response, NextFunction } from 'express';
import { logger } from './requestLogger';

export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Log the error with correlation ID
    logger.error('Error processed', {
        requestId: req.id,
        message: err.message,
        stack: err.stack,
        statusCode,
    });

    // Operational errors (known) sent to client
    if (err.isOperational) {
        res.status(statusCode).json({
            status: 'error',
            message,
        });
    } else {
        // Programming or unknown errors: don't leak details
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong',
        });
    }
};
