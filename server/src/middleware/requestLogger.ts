import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    defaultMeta: { service: 'unity-backend' },
    transports: [
        new winston.transports.Console()
    ],
});

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            id: string;
        }
    }
}

export const addRequestId = (req: Request, res: Response, next: NextFunction) => {
    req.id = uuidv4();
    res.setHeader('X-Request-ID', req.id);
    next();
};

export const requestLogger = morgan((tokens, req, res) => {
    const expressReq = req as Request;
    return JSON.stringify({
        timestamp: tokens.date(req, res, 'iso'),
        requestId: expressReq.id,
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        status: Number(tokens.status(req, res)),
        responseTime: Number(tokens['response-time'](req, res)),
        remoteAddr: tokens['remote-addr'](req, res),
    });
}, {
    stream: {
        write: (message: string) => {
            logger.info('HTTP Request', JSON.parse(message));
        },
    },
});

export { logger };
