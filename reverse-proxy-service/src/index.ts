import express from 'express';
import { logger } from '@/utils/logger';
import httpProxy from 'http-proxy';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
let BASE_PATH = process.env.BASE_PATH || '';

BASE_PATH = BASE_PATH.endsWith('/') ? BASE_PATH.substring(0, BASE_PATH.length - 1) : BASE_PATH;

const proxy = httpProxy.createProxy();

app.use((req, res) => {
  try {
    const hostname = req.hostname;
    logger.debug('hostname', hostname);
    const subdomain = hostname.split('.')[0];

    // We can add custom domain too by adding a mapping between custom domain and ID using DB

    // logger.debug('Requested asset ', subdomain);

    // logger.debug('Base Path', BASE_PATH);

    const resolvesTo = `${BASE_PATH}/${subdomain}`;

    // logger.debug('Resolves to ', resolvesTo);
    return proxy.web(req, res, { target: resolvesTo, changeOrigin: true });
  } catch (err: any) {
    logger.error(err);
    return res.status(500).json({ message: err.message });
  }
});

proxy.on('proxyReq', (proxyReq, req, res) => {
  const url = req.url;
  if (url === '/')
    proxyReq.path += 'index.html';
    return proxyReq;
})

app.listen(PORT, () => {
  logger.info(`Reverse Proxy Server started on ${PORT}`);
});
