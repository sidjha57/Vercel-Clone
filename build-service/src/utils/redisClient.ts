import { Redis } from 'ioredis';
import { logger } from './logger';
import dotenv from 'dotenv';
dotenv.config();

let redisClient: Redis;
try {
  redisClient = new Redis(process.env.REDIS_CONNECTION_STRING || '');
} catch (error) {
  logger.error(error);
}

export { redisClient };
