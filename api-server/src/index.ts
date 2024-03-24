import express from 'express';
import { logger } from '@/utils/logger';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 9000;

app.use(express.json())

app.listen(PORT, () => {
  logger.info(`API Server started on ${PORT}`);
});
