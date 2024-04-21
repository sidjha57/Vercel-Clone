import { Redis } from 'ioredis';
import { logger } from './logger';
import dotenv from 'dotenv';
dotenv.config();

let subscriber: Redis;
try {
  subscriber = new Redis(process.env.REDIS_CONNECTION_STRING || '');
  logger.info('Successfully connected to Redis');
} catch (error) {
  logger.error(error);
}

export { subscriber };
