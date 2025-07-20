// routes/admin.routes.js - Routes Administration
const express = require('express');
const router = express.Router();
const SmartLink = require('../models/SmartLink');
const User = require('../models/User');
const { MonitoringService } = require('../utils/monitoring');

const monitoring = new MonitoringService();

// Middleware d'authentification admin
const requireAdmin = (req, res, next) => {
  // Ici vous devriez vérifier que l'utilisateur est admin
  // Pour l'exemple, on vérifie un header
  if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Statistiques globales
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case '24h':
        startDate.setHours(endDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
    }

    // Statistiques des SmartLinks
    const totalLinks = await SmartLink.countDocuments();
    const newLinksThisPeriod = await SmartLink.countDocuments({
      createdAt: { $gte: startDate }
    });

    // Statistiques des utilisateurs
    const totalUsers = await User.countDocuments();
    const newUsersThisPeriod = await User.countDocuments({
      createdAt: { $gte: startDate }
    });

    // Agrégation des vues et clics
    const smartLinks = await SmartLink.find({});
    let totalViews = 0;
    let totalClicks = 0;
    let viewsThisPeriod = 0;
    let clicksThisPeriod = 0;

    smartLinks.forEach(link => {
      totalViews += link.analytics?.views || 0;
      
      const periodClicks = (link.analytics?.clicks || []).filter(
        click => new Date(click.timestamp) >= startDate
      );
      
      totalClicks += link.analytics?.clicks?.length || 0;
      clicksThisPeriod += periodClicks.length;
    });

    // Taux de conversion
    const conversionRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : 0;

    // Données pour les graphiques
    const trafficChart = await generateTrafficChart(timeframe);
    const platformsChart = await generatePlatformsChart();
    const activeUsersChart = await generateActiveUsersChart(timeframe);

    res.json({
      totalLinks,
      newLinksThisPeriod,
      totalUsers,
      newUsersThisPeriod,
      totalViews,
      totalClicks,
      viewsThisPeriod,
      clicksThisPeriod,
      conversionRate,
      estimatedRevenue: Math.round(totalClicks * 0.02), // Estimation
      revenueThisPeriod: Math.round(clicksThisPeriod * 0.02),
      conversionChange: 0, // À implémenter
      trafficChart,
      platformsChart,
      activeUsersChart
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// État du système
router.get('/health', requireAdmin, async (req, res) => {
  try {
    const health = await monitoring.checkSystemHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: 'Health check failed' });
  }
});

// Utilisateurs récents
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-password');

    // Ajouter le nombre de SmartLinks par utilisateur
    for (let user of users) {
      user.smartLinksCount = await SmartLink.countDocuments({ userId: user._id });
      user.isActive = user.lastLoginAt && 
        (new Date() - new Date(user.lastLoginAt)) < 7 * 24 * 60 * 60 * 1000; // Actif dans les 7 derniers jours
    }

    res.json(users);
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// SmartLinks récents
router.get('/recent-links', requireAdmin, async (req, res) => {
  try {
    const links = await SmartLink.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .select('title artist artwork createdAt analytics');

    const enrichedLinks = links.map(link => ({
      ...link.toObject(),
      views: link.analytics?.views || 0,
      clicks: link.analytics?.clicks?.length || 0
    }));

    res.json(enrichedLinks);
  } catch (error) {
    console.error('Admin recent links error:', error);
    res.status(500).json({ error: 'Failed to fetch recent links' });
  }
});

// Gestion des utilisateurs
router.delete('/users/:userId', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Supprimer tous les SmartLinks de l'utilisateur
    await SmartLink.deleteMany({ userId });
    
    // Supprimer l'utilisateur
    await User.findByIdAndDelete(userId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Modération de SmartLinks
router.delete('/smartlinks/:linkId', requireAdmin, async (req, res) => {
  try {
    const { linkId } = req.params;
    await SmartLink.findByIdAndDelete(linkId);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete SmartLink error:', error);
    res.status(500).json({ error: 'Failed to delete SmartLink' });
  }
});

// Fonctions helper pour les graphiques
async function generateTrafficChart(timeframe) {
  // Générer des données de trafic par jour
  const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
  const labels = [];
  const views = [];
  const clicks = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString());
    
    // Simulation de données - à remplacer par de vraies requêtes
    views.push(Math.floor(Math.random() * 1000) + 100);
    clicks.push(Math.floor(Math.random() * 200) + 20);
  }

  return {
    labels,
    datasets: [
      {
        label: 'Vues',
        data: views,
        borderColor: '#1DB954',
        backgroundColor: 'rgba(29, 185, 84, 0.1)'
      },
      {
        label: 'Clics',
        data: clicks,
        borderColor: '#1ed760',
        backgroundColor: 'rgba(30, 215, 96, 0.1)'
      }
    ]
  };
}

async function generatePlatformsChart() {
  // Agrégation des clics par plateforme
  const smartLinks = await SmartLink.find({});
  const platformCounts = {};

  smartLinks.forEach(link => {
    (link.analytics?.clicks || []).forEach(click => {
      if (click.platform) {
        platformCounts[click.platform] = (platformCounts[click.platform] || 0) + 1;
      }
    });
  });

  const sortedPlatforms = Object.entries(platformCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  return {
    labels: sortedPlatforms.map(([name]) => name),
    datasets: [{
      data: sortedPlatforms.map(([,count]) => count),
      backgroundColor: [
        '#1DB954', '#FA233B', '#242C3C', '#FF0000', '#EF5466', 
        '#000000', '#FF5500', '#005483', '#1e3264', '#8e44ad'
      ]
    }]
  };
}

async function generateActiveUsersChart(timeframe) {
  const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
  const labels = [];
  const activeUsers = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString());
    
    // Simulation - à remplacer par de vraies données
    activeUsers.push(Math.floor(Math.random() * 50) + 10);
  }

  return {
    labels,
    datasets: [{
      label: 'Utilisateurs Actifs',
      data: activeUsers,
      backgroundColor: '#667eea',
      borderColor: '#764ba2'
    }]
  };
}

module.exports = router;