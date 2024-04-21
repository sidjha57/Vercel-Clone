import path from 'path';
import { exec } from 'node:child_process';
import fs from 'node:fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import mime from 'mime-types';
import { logger } from '@/utils/logger.js';
import { publishLog } from './utils/publishLog';
import dotenv from 'dotenv';
dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION ?? 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? ''
  },
  // endpoint: process.env.AWS_ENDPOINT_URL ?? ''
});

const PROJECT_ID = process.env.PROJECT_ID;
const scriptDirPath = path.dirname(new URL(import.meta.url).pathname);

async function init(): Promise<void> {
  logger.info('Executing script.js');
  publishLog('Build Started...');
  const outDirPath = path.join(scriptDirPath, 'output');

  const p = exec(`cd ${outDirPath} && npm install && npm run build`);

  if (p.stdout != null) {
    p.stdout.on('data', function (data) {
      logger.info(data.toString());
      publishLog(data.toString());
    });

    p.stdout.on('error', function (data) {
      logger.info('Error', data.toString());
      publishLog(`error: ${data.toString()}`);
    });
  }

  try {
    await new Promise<void>((resolve, reject) => {
      p.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Child process exited with code ${code}`));
        }
      });
    });

    logger.info('Build Completed successfully');
    publishLog('Build Completed');

    const distFolderPath = path.join(scriptDirPath, 'output', 'dist');
    const distFolderContents = fs.readdirSync(distFolderPath, {
      recursive: true
    });

    publishLog('Starting to upload');
    // To be fixed the code files could be very large so need to limit the number of uploads in one time
    const uploadPromises = distFolderContents.map(async (file) => {
      const filePath = path.join(distFolderPath, file as string);
      if (fs.lstatSync(filePath).isDirectory()) return;

      logger.info('uploading', filePath);
      publishLog(`uploading ${file}`);

      const command = new PutObjectCommand({
        Bucket: process.env.VERCEL_BUCKET_NAME,
        Key: `__outputs/${PROJECT_ID}/${file as string}`,
        Body: fs.createReadStream(filePath),
        ContentType: mime.lookup(filePath).toString()
      });

      await s3Client.send(command);

      logger.info('uploaded', filePath);
      publishLog(`uploaded ${file}`);
    });

    await Promise.all(uploadPromises);

    logger.info('Done ...');
    publishLog(`Done ...`);
  } catch (err) {
    logger.error('An error occurred:', err);
    publishLog(`Error: ${err}`);
  }
}

await init();
