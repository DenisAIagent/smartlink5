const Redis = require('ioredis');
const { promisify } = require('util');

class RateLimitStatsService {
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
    this.requestsKey = 'rate_limit:requests';
    this.errorsKey = 'rate_limit:errors';
    this.retriesKey = 'rate_limit:retries';
    this.endpointsKey = 'rate_limit:endpoints';
    this.cacheKey = 'rate_limit:cache';
    this.cacheTTL = 60; // 60 secondes

    // Pipeline Redis optimisé
    this.pipeline = this.redis.pipeline();
    this.pipelineExec = promisify(this.pipeline.exec).bind(this.pipeline);
  }

  async trackRequest(endpoint) {
    const timestamp = Date.now();
    const pipeline = this.redis.pipeline();

    // Utiliser MULTI pour la cohérence des données
    await this.redis.multi()
      .zadd(this.requestsKey, timestamp, JSON.stringify({
        endpoint,
        timestamp,
        count: 1
      }))
      .sadd(this.endpointsKey, endpoint)
      .zremrangebyscore(this.requestsKey, 0, timestamp - 7 * 24 * 60 * 60 * 1000)
      .exec();

    // Invalider le cache
    await this.invalidateCache();
  }

  async trackError(endpoint, type) {
    const timestamp = Date.now();
    await this.redis.multi()
      .zadd(this.errorsKey, timestamp, JSON.stringify({
        endpoint,
        type,
        timestamp,
        count: 1
      }))
      .zremrangebyscore(this.errorsKey, 0, timestamp - 7 * 24 * 60 * 60 * 1000)
      .exec();

    await this.invalidateCache();
  }

  async trackRetry(endpoint) {
    const timestamp = Date.now();
    await this.redis.multi()
      .zadd(this.retriesKey, timestamp, JSON.stringify({
        endpoint,
        timestamp,
        count: 1
      }))
      .zremrangebyscore(this.retriesKey, 0, timestamp - 7 * 24 * 60 * 60 * 1000)
      .exec();

    await this.invalidateCache();
  }

  async getStats(timeRange = '1h', endpoint = 'all') {
    // Vérifier le cache
    const cacheKey = `${this.cacheKey}:${timeRange}:${endpoint}`;
    const cachedStats = await this.redis.get(cacheKey);
    
    if (cachedStats) {
      return JSON.parse(cachedStats);
    }

    const now = Date.now();
    const startTime = this.getStartTime(timeRange);

    // Utiliser un pipeline pour récupérer toutes les données en une seule requête
    const [requests, errors, retries] = await this.redis
      .pipeline()
      .zrangebyscore(this.requestsKey, startTime, now)
      .zrangebyscore(this.errorsKey, startTime, now)
      .zrangebyscore(this.retriesKey, startTime, now)
      .exec();

    const stats = {
      requests: this.aggregateData(requests[1], endpoint),
      errors: this.aggregateData(errors[1], endpoint),
      retries: this.aggregateData(retries[1], endpoint)
    };

    // Mettre en cache les résultats
    await this.redis.setex(cacheKey, this.cacheTTL, JSON.stringify(stats));

    return stats;
  }

  async getEndpoints() {
    const cacheKey = `${this.cacheKey}:endpoints`;
    const cachedEndpoints = await this.redis.get(cacheKey);

    if (cachedEndpoints) {
      return JSON.parse(cachedEndpoints);
    }

    const endpoints = await this.redis.smembers(this.endpointsKey);
    await this.redis.setex(cacheKey, this.cacheTTL, JSON.stringify(endpoints));

    return endpoints;
  }

  getStartTime(timeRange) {
    const now = Date.now();
    switch (timeRange) {
      case '1h':
        return now - 60 * 60 * 1000;
      case '6h':
        return now - 6 * 60 * 60 * 1000;
      case '24h':
        return now - 24 * 60 * 60 * 1000;
      case '7d':
        return now - 7 * 24 * 60 * 60 * 1000;
      default:
        return now - 60 * 60 * 1000;
    }
  }

  aggregateData(data, endpoint) {
    const aggregated = new Map();

    // Utiliser une Map pour l'agrégation en mémoire
    data.forEach(item => {
      const { endpoint: itemEndpoint, timestamp, count, type } = JSON.parse(item);
      
      if (endpoint !== 'all' && itemEndpoint !== endpoint) {
        return;
      }

      const key = type ? `${itemEndpoint}:${type}` : itemEndpoint;
      const existing = aggregated.get(key) || { count: 0, timestamp };
      
      aggregated.set(key, {
        ...existing,
        count: existing.count + count
      });
    });

    return Array.from(aggregated.values());
  }

  async cleanup() {
    const now = Date.now();
    const pipeline = this.redis.pipeline();

    // Nettoyer les anciennes données et le cache en une seule opération
    pipeline
      .zremrangebyscore(this.requestsKey, 0, now - 7 * 24 * 60 * 60 * 1000)
      .zremrangebyscore(this.errorsKey, 0, now - 7 * 24 * 60 * 60 * 1000)
      .zremrangebyscore(this.retriesKey, 0, now - 7 * 24 * 60 * 60 * 1000)
      .del(`${this.cacheKey}:*`);

    await pipeline.exec();
  }

  async invalidateCache() {
    const keys = await this.redis.keys(`${this.cacheKey}:*`);
    if (keys.length > 0) {
      await this.redis.del(keys);
    }
  }
}

module.exports = new RateLimitStatsService(); 