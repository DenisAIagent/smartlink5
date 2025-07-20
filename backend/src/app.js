// src/app.js - Serveur principal Express
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de sécurité
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://smartlink4-frontend-staring.up.railway.app',
    process.env.CORS_ORIGIN
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key']
};

app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartlinks', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
});

// Routes
const smartlinkRoutes = require('../routes/smartlink.routes');
const analyticsRoutes = require('../routes/analytics.routes');
const adminRoutes = require('../routes/admin.routes');

app.use('/api/smartlinks', smartlinkRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// Direct scan route for frontend compatibility
app.post('/api/scan', require('express-rate-limit')({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: { error: 'Too many scan requests from this IP, please try again later.' }
}), async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validation URL basique
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(url)) {
      return res.status(400).json({ error: 'Valid URL is required' });
    }

    // Simuler l'appel à l'API Odesli (remplacer par vraie intégration)
    const mockOdesliResponse = {
      entityUniqueId: `mock_${Date.now()}`,
      userCountry: 'FR',
      pageUrl: url,
      linksByPlatform: {
        spotify: {
          url: 'https://open.spotify.com/track/example',
          nativeAppUriMobile: 'spotify://track/example',
          nativeAppUriDesktop: 'spotify://track/example'
        },
        appleMusic: {
          url: 'https://music.apple.com/track/example',
          nativeAppUriMobile: 'music://track/example',
          nativeAppUriDesktop: 'music://track/example'
        },
        deezer: {
          url: 'https://www.deezer.com/track/example',
          nativeAppUriMobile: 'deezer://track/example'
        },
        youtube: {
          url: 'https://www.youtube.com/watch?v=example',
          nativeAppUriMobile: 'youtube://watch?v=example'
        },
        soundcloud: {
          url: 'https://soundcloud.com/track/example'
        }
      },
      entitiesByUniqueId: {
        [`mock_${Date.now()}`]: {
          id: `mock_${Date.now()}`,
          type: 'song',
          title: 'Example Song',
          artistName: 'Example Artist',
          thumbnailUrl: 'https://via.placeholder.com/300x300?text=Album+Art',
          thumbnailWidth: 300,
          thumbnailHeight: 300
        }
      }
    };

    res.json({
      success: true,
      data: mockOdesliResponse,
      platforms: Object.keys(mockOdesliResponse.linksByPlatform),
      metadata: mockOdesliResponse.entitiesByUniqueId[Object.keys(mockOdesliResponse.entitiesByUniqueId)[0]]
    });
  } catch (error) {
    console.error('Error scanning URL:', error);
    res.status(500).json({ error: 'Failed to scan URL' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Landing page route pour SmartLinks
app.get('/l/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    // Ici nous servirions la page React ou redirigerions vers le frontend
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/link/${slug}`);
  } catch (error) {
    console.error('Landing page error:', error);
    res.status(500).send('Internal server error');
  }
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Middleware de gestion d'erreurs global
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 SmartLink API server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌍 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
});

module.exports = app;