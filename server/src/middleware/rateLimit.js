import rateLimit from 'express-rate-limit';

// Stops password guessing: each IP address gets 20 login/register attempts
// per 15 minutes, after that every attempt gets 429 Too Many Requests.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true, // send the RateLimit-* headers so clients can see the limit
  legacyHeaders: false, // but not the old X-RateLimit-* ones
  message: { message: 'Too many attempts. Please try again in 15 minutes.' },
  skip: () => process.env.NODE_ENV === 'test', // keep the automated tests from being blocked
});
