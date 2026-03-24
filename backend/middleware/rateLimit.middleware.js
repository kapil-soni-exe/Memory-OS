import rateLimit from 'express-rate-limit';

/**
 * Authentication Rate Limiter
 * Limits requests to auth routes to prevent brute-force attacks.
 * Max 10 requests every 15 minutes per IP.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  message: {
    message: "Too many login/register attempts. Please try again after 15 minutes."
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Global API Rate Limiter
 * Basic protection for all API endpoints.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // Limit each IP to 1000 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
});
