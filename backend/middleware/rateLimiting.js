// middleware/rateLimiting.js - Rate Limiting Avancé
const rateLimit = require('express-rate-limit');

// Rate limiter pour les créations de SmartLinks
const createSmartLinkLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10, // 10 créations par heure
  message: {
    error: 'Rate limit exceeded for SmartLink creation',
    retryAfter: 3600,
    limit: 10
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body.userId || req.ip
});

// Rate limiter pour les scans Odesli
const odesliScanLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 100, // 100 scans par heure
  message: {
    error: 'Rate limit exceeded for Odesli scans',
    retryAfter: 1800,
    limit: 100
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter pour les analytics
const analyticsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 1000, // 1000 requêtes par heure
  message: {
    error: 'Rate limit exceeded for analytics',
    retryAfter: 600,
    limit: 1000
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter basique pour les autres endpoints
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requêtes par IP
  message: {
    error: 'Too many requests from this IP',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  createSmartLink: createSmartLinkLimiter,
  odesliScan: odesliScanLimiter,
  analytics: analyticsLimiter,
  general: generalLimiter
};