
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { ApiError } from '../utils';
import { redis } from './redis';
import { NextFunction, Request, Response } from 'express';


export const userRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,

  store: new RedisStore({
    // @ts-ignore
    sendCommand: (...args) => redis.call(...args),
    prefix: 'rl:',
  }),

  handler: (_req:Request, _res:Response, _next:NextFunction, options) => {
    throw new ApiError(options.statusCode, "You've exceeded the request limit. Slow down!");
  },
});