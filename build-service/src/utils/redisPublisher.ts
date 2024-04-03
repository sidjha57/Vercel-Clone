import { Redis } from 'ioredis';
import { logger } from './logger';
import dotenv from 'dotenv';
dotenv.config();

let publisher: Redis;
try {
  publisher = new Redis(process.env.REDIS_CONNECTION_STRING || '');
} catch (error) {
  logger.error(error);
}

export { publisher };
