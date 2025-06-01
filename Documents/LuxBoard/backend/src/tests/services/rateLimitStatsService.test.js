const Redis = require('ioredis-mock');
const rateLimitStatsService = require('../../services/rateLimitStatsService');

jest.mock('ioredis', () => {
  return jest.fn(() => new Redis());
});

describe('RateLimitStatsService', () => {
  let redis;

  beforeEach(() => {
    redis = new Redis();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await redis.flushall();
  });

  describe('trackRequest', () => {
    it('devrait suivre une nouvelle requête', async () => {
      const endpoint = '/api/test';
      await rateLimitStatsService.trackRequest(endpoint);

      const requests = await redis.zrange(rateLimitStatsService.requestsKey, 0, -1);
      expect(requests).toHaveLength(1);

      const requestData = JSON.parse(requests[0]);
      expect(requestData.endpoint).toBe(endpoint);
      expect(requestData.count).toBe(1);
    });

    it('devrait ajouter l\'endpoint à la liste des endpoints', async () => {
      const endpoint = '/api/test';
      await rateLimitStatsService.trackRequest(endpoint);

      const endpoints = await redis.smembers(rateLimitStatsService.endpointsKey);
      expect(endpoints).toContain(endpoint);
    });
  });

  describe('trackError', () => {
    it('devrait suivre une nouvelle erreur', async () => {
      const endpoint = '/api/test';
      const type = 'RATE_LIMIT';
      await rateLimitStatsService.trackError(endpoint, type);

      const errors = await redis.zrange(rateLimitStatsService.errorsKey, 0, -1);
      expect(errors).toHaveLength(1);

      const errorData = JSON.parse(errors[0]);
      expect(errorData.endpoint).toBe(endpoint);
      expect(errorData.type).toBe(type);
      expect(errorData.count).toBe(1);
    });
  });

  describe('trackRetry', () => {
    it('devrait suivre un nouveau retry', async () => {
      const endpoint = '/api/test';
      await rateLimitStatsService.trackRetry(endpoint);

      const retries = await redis.zrange(rateLimitStatsService.retriesKey, 0, -1);
      expect(retries).toHaveLength(1);

      const retryData = JSON.parse(retries[0]);
      expect(retryData.endpoint).toBe(endpoint);
      expect(retryData.count).toBe(1);
    });
  });

  describe('getStats', () => {
    beforeEach(async () => {
      // Ajouter des données de test
      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;
      const twoHoursAgo = now - 2 * 60 * 60 * 1000;

      // Requêtes
      await redis.zadd(rateLimitStatsService.requestsKey, now, JSON.stringify({
        endpoint: '/api/test',
        count: 10,
        timestamp: now
      }));
      await redis.zadd(rateLimitStatsService.requestsKey, twoHoursAgo, JSON.stringify({
        endpoint: '/api/test',
        count: 5,
        timestamp: twoHoursAgo
      }));

      // Erreurs
      await redis.zadd(rateLimitStatsService.errorsKey, now, JSON.stringify({
        endpoint: '/api/test',
        type: 'RATE_LIMIT',
        count: 2,
        timestamp: now
      }));

      // Retries
      await redis.zadd(rateLimitStatsService.retriesKey, now, JSON.stringify({
        endpoint: '/api/test',
        count: 3,
        timestamp: now
      }));
    });

    it('devrait récupérer les statistiques pour la dernière heure', async () => {
      const stats = await rateLimitStatsService.getStats('1h');

      expect(stats.requests).toHaveLength(1);
      expect(stats.requests[0].count).toBe(10);
      expect(stats.errors).toHaveLength(1);
      expect(stats.errors[0].count).toBe(2);
      expect(stats.retries).toHaveLength(1);
      expect(stats.retries[0].count).toBe(3);
    });

    it('devrait filtrer par endpoint', async () => {
      const stats = await rateLimitStatsService.getStats('1h', '/api/test');

      expect(stats.requests).toHaveLength(1);
      expect(stats.requests[0].endpoint).toBe('/api/test');
    });

    it('devrait agréger les données correctement', async () => {
      // Ajouter une autre requête pour le même endpoint
      const now = Date.now();
      await redis.zadd(rateLimitStatsService.requestsKey, now, JSON.stringify({
        endpoint: '/api/test',
        count: 5,
        timestamp: now
      }));

      const stats = await rateLimitStatsService.getStats('1h');
      expect(stats.requests[0].count).toBe(15); // 10 + 5
    });
  });

  describe('getEndpoints', () => {
    it('devrait retourner la liste des endpoints', async () => {
      const endpoints = ['/api/test', '/api/users'];
      for (const endpoint of endpoints) {
        await redis.sadd(rateLimitStatsService.endpointsKey, endpoint);
      }

      const result = await rateLimitStatsService.getEndpoints();
      expect(result).toEqual(expect.arrayContaining(endpoints));
    });
  });

  describe('cleanup', () => {
    it('devrait nettoyer les anciennes données', async () => {
      const now = Date.now();
      const oldTimestamp = now - 8 * 24 * 60 * 60 * 1000; // 8 jours

      // Ajouter des données anciennes
      await redis.zadd(rateLimitStatsService.requestsKey, oldTimestamp, JSON.stringify({
        endpoint: '/api/test',
        count: 1,
        timestamp: oldTimestamp
      }));

      await rateLimitStatsService.cleanup();

      const requests = await redis.zrange(rateLimitStatsService.requestsKey, 0, -1);
      expect(requests).toHaveLength(0);
    });
  });
}); 