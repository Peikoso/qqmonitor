import ratelimit from 'express-rate-limit';

export const GlobalLimiter = ratelimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 1000, 
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.'
});

export const RegisterLimiter = ratelimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many authentication attempts from this IP, please try again later.'
});