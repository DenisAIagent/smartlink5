// utils/monitoring.js - Monitoring et Alertes
class MonitoringService {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: [],
      smartLinksCreated: 0,
      platformClicks: 0
    };
    
    this.startMonitoring();
  }

  startMonitoring() {
    // Envoyer les métriques toutes les minutes
    setInterval(() => {
      this.sendMetrics();
      this.resetMetrics();
    }, 60000);

    // Vérifier la santé du système toutes les 30 secondes
    setInterval(() => {
      this.checkSystemHealth();
    }, 30000);
  }

  trackRequest(req, res, next) {
    const start = Date.now();
    this.metrics.requests++;

    res.on('finish', () => {
      const responseTime = Date.now() - start;
      this.metrics.responseTime.push(responseTime);

      if (res.statusCode >= 400) {
        this.metrics.errors++;
      }

      // Alertes pour temps de réponse élevé
      if (responseTime > 5000) {
        this.sendAlert('HIGH_RESPONSE_TIME', {
          responseTime,
          endpoint: req.path,
          method: req.method
        });
      }
    });

    next();
  }

  trackSmartLinkCreated() {
    this.metrics.smartLinksCreated++;
  }

  trackPlatformClick() {
    this.metrics.platformClicks++;
  }

  async checkSystemHealth() {
    const health = {
      timestamp: new Date(),
      database: await this.checkDatabase(),
      odesli: await this.checkOdesliAPI(),
      memory: this.getMemoryUsage(),
      responseTime: this.getAverageResponseTime()
    };

    // Alertes de santé
    if (!health.database) {
      this.sendAlert('DATABASE_DOWN', health);
    }

    if (!health.odesli) {
      this.sendAlert('ODESLI_API_DOWN', health);
    }

    if (health.memory > 90) {
      this.sendAlert('HIGH_MEMORY_USAGE', health);
    }

    return health;
  }

  async checkDatabase() {
    try {
      const mongoose = require('mongoose');
      return mongoose.connection.readyState === 1;
    } catch (error) {
      return false;
    }
  }

  async checkOdesliAPI() {
    try {
      const response = await fetch('https://api.song.link/v1-alpha.1/links?url=https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC', {
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  getMemoryUsage() {
    const used = process.memoryUsage();
    return Math.round(used.heapUsed / used.heapTotal * 100);
  }

  getAverageResponseTime() {
    if (this.metrics.responseTime.length === 0) return 0;
    const sum = this.metrics.responseTime.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.metrics.responseTime.length);
  }

  async sendMetrics() {
    const metrics = {
      ...this.metrics,
      avgResponseTime: this.getAverageResponseTime(),
      timestamp: new Date()
    };

    // Envoyer à un service de monitoring (DataDog, NewRelic, etc.)
    console.log('Metrics:', metrics);
    
    // Webhook pour monitoring externe
    if (process.env.MONITORING_WEBHOOK) {
      try {
        await fetch(process.env.MONITORING_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metrics)
        });
      } catch (error) {
        console.error('Failed to send metrics:', error);
      }
    }
  }

  async sendAlert(type, data) {
    const alert = {
      type,
      data,
      timestamp: new Date(),
      severity: this.getAlertSeverity(type)
    };

    console.error('ALERT:', alert);

    // Envoyer l'alerte par email, Slack, etc.
    if (process.env.ALERTS_WEBHOOK) {
      try {
        await fetch(process.env.ALERTS_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alert)
        });
      } catch (error) {
        console.error('Failed to send alert:', error);
      }
    }
  }

  getAlertSeverity(type) {
    const severityMap = {
      'DATABASE_DOWN': 'critical',
      'ODESLI_API_DOWN': 'high',
      'HIGH_MEMORY_USAGE': 'medium',
      'HIGH_RESPONSE_TIME': 'low'
    };
    return severityMap[type] || 'low';
  }

  resetMetrics() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: [],
      smartLinksCreated: 0,
      platformClicks: 0
    };
  }
}

module.exports = { MonitoringService };