import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000, // Increased from 100 to 10000 for local dev
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Too many requests, please try again later."
    }
});

export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000, // Increased from 10 to 1000 for local dev
    message: {
        error: "Too many login attempts from this IP, please try again later."
    }
});

export const signupLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 1000, // Increased from 5 to 1000 for local dev
    message: {
        error: "Too many accounts created from this IP."
    }
});

// Export apiLimiter as 'limiter' for consistency
export const limiter = apiLimiter;
