// routes/admin.routes.js - Routes Administration
const express = require('express');
const router = express.Router();
// TODO: Implement MongoDB models when database is set up
// const SmartLink = require('../models/SmartLink');
// const User = require('../models/User');
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
    
    // Mock data for now - replace with real database queries when models are implemented
    const mockStats = {
      totalLinks: 150,
      newLinksThisPeriod: 12,
      totalUsers: 89,
      newUsersThisPeriod: 8,
      totalViews: 2450,
      totalClicks: 890,
      viewsThisPeriod: 340,
      clicksThisPeriod: 125,
      conversionRate: 36.3,
      estimatedRevenue: 18,
      revenueThisPeriod: 3,
      conversionChange: 5.2,
      trafficChart: await generateTrafficChart(timeframe),
      platformsChart: await generatePlatformsChart(),
      activeUsersChart: await generateActiveUsersChart(timeframe)
    };

    res.json(mockStats);
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
    // Mock data for now
    const mockUsers = [
      {
        _id: '1',
        email: 'user1@example.com',
        name: 'John Doe',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        smartLinksCount: 5,
        isActive: true
      },
      {
        _id: '2', 
        email: 'user2@example.com',
        name: 'Jane Smith',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        smartLinksCount: 3,
        isActive: false
      }
    ];

    res.json(mockUsers);
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// SmartLinks récents
router.get('/recent-links', requireAdmin, async (req, res) => {
  try {
    // Mock data for now
    const mockLinks = [
      {
        _id: '1',
        title: 'Amazing Song',
        artist: 'Cool Artist',
        artwork: 'https://via.placeholder.com/300x300',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        views: 45,
        clicks: 12
      },
      {
        _id: '2',
        title: 'Another Hit',
        artist: 'Popular Band',
        artwork: 'https://via.placeholder.com/300x300',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        views: 89,
        clicks: 25
      }
    ];

    res.json(mockLinks);
  } catch (error) {
    console.error('Admin recent links error:', error);
    res.status(500).json({ error: 'Failed to fetch recent links' });
  }
});

// Gestion des utilisateurs
router.delete('/users/:userId', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Mock success response for now
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Modération de SmartLinks
router.delete('/smartlinks/:linkId', requireAdmin, async (req, res) => {
  try {
    const { linkId } = req.params;
    
    // Mock success response for now
    res.json({ success: true, message: 'SmartLink deleted successfully' });
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
  // Mock platform data for now
  const mockPlatformData = {
    'Spotify': 450,
    'Apple Music': 320,
    'YouTube': 280,
    'Deezer': 150,
    'SoundCloud': 120,
    'Amazon Music': 90,
    'Tidal': 60,
    'Bandcamp': 45
  };

  const sortedPlatforms = Object.entries(mockPlatformData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8);

  return {
    labels: sortedPlatforms.map(([name]) => name),
    datasets: [{
      data: sortedPlatforms.map(([,count]) => count),
      backgroundColor: [
        '#1DB954', '#FA233B', '#242C3C', '#FF0000', '#EF5466', 
        '#000000', '#FF5500', '#005483'
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