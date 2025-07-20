// backend/routes/analytics.routes.js - Routes pour les analytics des SmartLinks
const express = require('express');
const router = express.Router();

// Simuler une base de données temporaire pour les analytics
let analyticsData = [];

// GET /api/analytics/:slug - Obtenir les analytics d'un SmartLink
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { startDate, endDate, platform } = req.query;

    // Filtrer les données analytics par slug
    let data = analyticsData.filter(record => record.slug === slug);

    // Filtrer par date si spécifié
    if (startDate) {
      data = data.filter(record => new Date(record.timestamp) >= new Date(startDate));
    }
    if (endDate) {
      data = data.filter(record => new Date(record.timestamp) <= new Date(endDate));
    }

    // Filtrer par plateforme si spécifié
    if (platform) {
      data = data.filter(record => record.platform === platform);
    }

    // Calculer les statistiques agrégées
    const totalClicks = data.length;
    const uniqueUsers = [...new Set(data.map(record => record.userId || record.ip))].length;
    
    const platformStats = data.reduce((acc, record) => {
      acc[record.platform] = (acc[record.platform] || 0) + 1;
      return acc;
    }, {});

    const countryStats = data.reduce((acc, record) => {
      if (record.country) {
        acc[record.country] = (acc[record.country] || 0) + 1;
      }
      return acc;
    }, {});

    const deviceStats = data.reduce((acc, record) => {
      const deviceType = record.deviceType || 'unknown';
      acc[deviceType] = (acc[deviceType] || 0) + 1;
      return acc;
    }, {});

    // Données pour le graphique temporel (par jour)
    const dailyStats = data.reduce((acc, record) => {
      const date = new Date(record.timestamp).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      analytics: {
        slug,
        totalClicks,
        uniqueUsers,
        platformStats,
        countryStats,
        deviceStats,
        dailyStats,
        rawData: data.slice(0, 100) // Limiter à 100 entrées pour la performance
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// POST /api/analytics/track - Enregistrer un événement analytics
router.post('/track', async (req, res) => {
  try {
    const {
      slug,
      eventType,
      platform,
      userAgent,
      ip,
      country,
      userId,
      customData
    } = req.body;

    if (!slug || !eventType) {
      return res.status(400).json({ 
        error: 'Slug and eventType are required' 
      });
    }

    // Déterminer le type d'appareil à partir du User-Agent
    const deviceType = getUserDeviceType(userAgent);

    // Créer l'enregistrement analytics
    const analyticsRecord = {
      id: Date.now() + Math.random(),
      slug,
      eventType, // 'view', 'click', 'conversion', etc.
      platform,
      timestamp: new Date(),
      userAgent,
      ip,
      country,
      userId,
      deviceType,
      customData: customData || {}
    };

    analyticsData.push(analyticsRecord);

    // Nettoyer les anciennes données (garder seulement les 30 derniers jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    analyticsData = analyticsData.filter(record => 
      new Date(record.timestamp) >= thirtyDaysAgo
    );

    res.json({
      success: true,
      message: 'Analytics event tracked successfully',
      eventId: analyticsRecord.id
    });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    res.status(500).json({ error: 'Failed to track analytics event' });
  }
});

// GET /api/analytics/dashboard/:slug - Données pour le dashboard
router.get('/dashboard/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { period = '7d' } = req.query;

    // Calculer la période
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Filtrer les données pour la période
    const periodData = analyticsData.filter(record => 
      record.slug === slug && new Date(record.timestamp) >= startDate
    );

    // Calculer les métriques principales
    const totalViews = periodData.filter(r => r.eventType === 'view').length;
    const totalClicks = periodData.filter(r => r.eventType === 'click').length;
    const conversionRate = totalViews > 0 ? (totalClicks / totalViews * 100).toFixed(2) : 0;

    // Top plateformes
    const topPlatforms = periodData
      .filter(r => r.eventType === 'click' && r.platform)
      .reduce((acc, record) => {
        acc[record.platform] = (acc[record.platform] || 0) + 1;
        return acc;
      }, {});

    const topPlatformsArray = Object.entries(topPlatforms)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([platform, clicks]) => ({ platform, clicks }));

    // Évolution temporelle
    const timeSeriesData = getTimeSeriesData(periodData, period);

    res.json({
      success: true,
      dashboard: {
        slug,
        period,
        metrics: {
          totalViews,
          totalClicks,
          conversionRate: parseFloat(conversionRate),
          uniqueUsers: [...new Set(periodData.map(r => r.userId || r.ip))].length
        },
        topPlatforms: topPlatformsArray,
        timeSeries: timeSeriesData,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// GET /api/analytics/export/:slug - Exporter les données analytics
router.get('/export/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { format = 'json', startDate, endDate } = req.query;

    let data = analyticsData.filter(record => record.slug === slug);

    if (startDate) {
      data = data.filter(record => new Date(record.timestamp) >= new Date(startDate));
    }
    if (endDate) {
      data = data.filter(record => new Date(record.timestamp) <= new Date(endDate));
    }

    if (format === 'csv') {
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${slug}.csv`);
      res.send(csv);
    } else {
      res.json({
        success: true,
        data,
        total: data.length,
        exportedAt: new Date()
      });
    }
  } catch (error) {
    console.error('Error exporting analytics:', error);
    res.status(500).json({ error: 'Failed to export analytics data' });
  }
});

// Fonction utilitaire pour déterminer le type d'appareil
function getUserDeviceType(userAgent) {
  if (!userAgent) return 'unknown';
  
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

// Fonction utilitaire pour générer des données de série temporelle
function getTimeSeriesData(data, period) {
  const timeUnit = period === '24h' ? 'hour' : 'day';
  const now = new Date();
  const series = {};

  // Initialiser la série avec des zéros
  if (timeUnit === 'hour') {
    for (let i = 0; i < 24; i++) {
      const hour = new Date(now);
      hour.setHours(hour.getHours() - i);
      const key = hour.toISOString().split('T')[1].split(':')[0] + 'h';
      series[key] = { views: 0, clicks: 0 };
    }
  } else {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    for (let i = 0; i < days; i++) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      const key = day.toISOString().split('T')[0];
      series[key] = { views: 0, clicks: 0 };
    }
  }

  // Remplir avec les vraies données
  data.forEach(record => {
    const timestamp = new Date(record.timestamp);
    let key;
    
    if (timeUnit === 'hour') {
      key = timestamp.toISOString().split('T')[1].split(':')[0] + 'h';
    } else {
      key = timestamp.toISOString().split('T')[0];
    }

    if (series[key]) {
      if (record.eventType === 'view') {
        series[key].views++;
      } else if (record.eventType === 'click') {
        series[key].clicks++;
      }
    }
  });

  return Object.entries(series)
    .map(([time, data]) => ({ time, ...data }))
    .reverse();
}

// Fonction utilitaire pour convertir en CSV
function convertToCSV(data) {
  if (data.length === 0) return '';

  const headers = ['timestamp', 'eventType', 'platform', 'country', 'deviceType', 'ip'];
  const rows = data.map(record => 
    headers.map(header => record[header] || '').join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

module.exports = router;