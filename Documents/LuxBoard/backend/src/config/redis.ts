import Redis from 'ioredis';
import { logger } from '../utils/logger';

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0')
};

export const redisClient = new Redis(redisConfig);

redisClient.on('connect', () => {
  logger.info('Connexion à Redis établie');
});

redisClient.on('error', (error) => {
  logger.error('Erreur de connexion Redis:', error);
});

redisClient.on('close', () => {
  logger.info('Connexion Redis fermée');
}); 