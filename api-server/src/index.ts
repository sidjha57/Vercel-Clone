import express from 'express';
import { logger } from '@/utils/logger';
import { ECSClient, RunTaskCommand } from '@aws-sdk/client-ecs';
import { generateSlug } from 'random-word-slugs'
import dotenv from 'dotenv';
import { initRedisSubscribe } from '@/utils/socketIO';
import cors from 'cors';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 9000;

if (process.env.NODE_ENV !== 'production')  {
  app.use(cors());
}

const ecsClient = new ECSClient({
  region: process.env.AWS_REGION ?? 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
  },
});

const builderConfig = {
  CLUSTER: process.env.AWS_BUILDER_CLUSTER || '',
  TASK: process.env.AWS_BUILDER_TASK || '',
};

initRedisSubscribe()

app.use(express.json());

app.post('/project', async (req, res) => {
  try {
    const { gitURL } = req.body;
    if (gitURL === '' || gitURL.length === 0) {
      return res.status(400).json({ status: 'failed', message: 'Invalid github url' });
    }

    // Add a validation to check if the git URL is correct

    const projectID = generateSlug();

    // Spin the container
    const command = new RunTaskCommand({
      cluster: builderConfig.CLUSTER,
      taskDefinition: builderConfig.TASK,
      launchType: 'FARGATE',
      count: 1,
      networkConfiguration: {
        awsvpcConfiguration: {
          assignPublicIp: 'ENABLED',
          subnets: process.env.AWS_BUILDER_CLUSTER_SUBNETS?.split(',') || [],
          securityGroups: [process.env.AWS_BUILDER_CLUSTER_SECURITY_GROUP || ''],
        },
      },
      overrides: {
        containerOverrides: [
          {
            name: 'builder-image',
            environment: [
              { name: 'GIT_REPOSITORY__URL', value: gitURL },
              { name: 'PROJECT_ID', value: projectID },
              { name: 'VERCEL_BUCKET_NAME', value: process.env.VERCEL_BUCKET_NAME },
              { name: 'AWS_ACCESS_KEY_ID', value: process.env.AWS_ACCESS_KEY_ID },
              { name: 'AWS_SECRET_ACCESS_KEY', value: process.env.AWS_SECRET_ACCESS_KEY },
              { name: 'AWS_REGION', value: process.env.AWS_REGION || 'ap-south-1' },
            ],
          },
        ],
      },
    });

    await ecsClient.send(command);

    return res.json({
      status: 'queued',
      data: { projectID, url: `http://${projectID}.localhost:8000` },
    });
  } catch (err: any) {
    res.status(500).json({ status: 'failed', message: err.message });
  }
});

app.listen(PORT, () => {
  logger.info(`API Server started on ${PORT}`);
});
