// services/cacheService.js - Service de Cache Redis
const redis = require('redis');

class CacheService {
  constructor() {
    this.client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
    
    this.client.connect().catch(console.error);
  }

  async get(key) {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  async flushAll() {
    try {
      await this.client.flushAll();
      return true;
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  }

  // Cache spécifique pour les SmartLinks
  async getSmartLink(slug) {
    return await this.get(`smartlink:${slug}`);
  }

  async setSmartLink(slug, data) {
    return await this.set(`smartlink:${slug}`, data, 1800); // 30 minutes
  }

  // Cache pour les analytics
  async getAnalytics(linkId, timeframe) {
    return await this.get(`analytics:${linkId}:${timeframe}`);
  }

  async setAnalytics(linkId, timeframe, data) {
    return await this.set(`analytics:${linkId}:${timeframe}`, data, 600); // 10 minutes
  }

  // Cache pour les résultats Odesli
  async getOdesliResults(sourceUrl) {
    const cacheKey = `odesli:${Buffer.from(sourceUrl).toString('base64')}`;
    return await this.get(cacheKey);
  }

  async setOdesliResults(sourceUrl, data) {
    const cacheKey = `odesli:${Buffer.from(sourceUrl).toString('base64')}`;
    return await this.set(cacheKey, data, 7200); // 2 heures
  }
}

module.exports = { CacheService };