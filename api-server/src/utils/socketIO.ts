import { Server } from 'socket.io';
import { logger } from './logger';
import { subscriber } from './redisSubscriber';
import { channel } from 'diagnostics_channel';

const io = new Server({
    cors: {
        origin: '*', // Allow requests from any origin
    }
});

io.on('connection', (socket) => {
  logger.info('Connected to user');
  socket.on('subscribe', (channel) => {
    logger.info(`Received subscription request for channel: ${channel}`); // Add additional logging
    socket.join(channel);
    logger.info(`Subscribed to ${channel}`); // Use backticks for template literals
    socket.emit('message', `Joined ${channel}`);
  });

  socket.on('disconnect', () => {
    logger.info('User disconnected');
  });
});

const port = Number(process.env.SOCKET_SERVER_PORT) || 9003;
io.listen(port, () => {
  logger.info(`Socket server running on port ${port}`);
});

export async function initRedisSubscribe() {
  logger.info('Subscribed to logs ...');
  subscriber.psubscribe('logs:*');
  subscriber.on('pmessage', (pattern, channel, message) => {
    logger.debug(`Received message from Redis on channel ${channel}: ${message}`);
    io.to(channel).emit('message', message);
  });
}
