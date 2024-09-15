import rateLimit from "express-rate-limit";

// Rate limiter middleware
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    skipSuccessfulRequests: true,
});

export default authLimiter;
