import rateLimit from 'express-rate-limit';
import { config } from '../config.js';
export const loginRateLimiter = rateLimit({
    windowMs: config.authRateLimitWindowMs,
    max: config.authRateLimitMaxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_request, response) => {
        response.status(429).json({
            success: false,
            message: 'Too many login attempts. Please try again later.',
        });
    },
});
