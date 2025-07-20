// backend/src/app.js - Version corrigée CORS + MongoDB
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de sécurité
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// CORS Configuration TRÈS PERMISSIVE pour Railway
const corsOptions = {
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origin (applications mobiles, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Autoriser tous les domaines Railway
    if (origin.includes('.railway.app') || origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // Autoriser le domaine configuré
    if (process.env.CORS_ORIGIN === '*' || process.env.CORS_ORIGIN === origin) {
      return callback(null, true);
    }
    
    // En développement, autoriser tout
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin', 
    'X-Requested-With', 
    'Content-Type', 
    'Accept', 
    'Authorization', 
    'x-admin-key',
    'Cache-Control'
  ],
  exposedHeaders: ['Content-Length', 'X-Request-ID'],
  maxAge: 86400 // Cache preflight pendant 24h
};

app.use(cors(corsOptions));

// Middleware pour gérer les requêtes OPTIONS explicitement
app.options('*', cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Servir les fichiers statiques
app.use(express.static('public'));

// MongoDB Connection avec retry logic
let dbConnected = false;
let connectionAttempts = 0;
const maxRetries = 5;

const connectDB = async () => {
  if (connectionAttempts >= maxRetries) {
    console.log('⚠️ Max MongoDB connection attempts reached, continuing without DB');
    return false;
  }

  try {
    connectionAttempts++;
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is not set');
      console.log('📋 Available MONGO env vars:', Object.keys(process.env).filter(k => k.includes('MONGO')));
      return false;
    }

    console.log(`🔄 MongoDB connection attempt ${connectionAttempts}/${maxRetries}`);
    console.log('🔗 Connecting to:', process.env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));

    const mongoOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 3,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,
      retryWrites: true,
      w: 'majority'
    };

    await mongoose.connect(process.env.MONGODB_URI, mongoOptions);
    dbConnected = true;
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error(`❌ MongoDB connection error (attempt ${connectionAttempts}):`, error.message);
    
    // Retry après un délai
    if (connectionAttempts < maxRetries) {
      console.log(`🔄 Retrying in 5 seconds...`);
      setTimeout(connectDB, 5000);
    }
    return false;
  }
};

// Initialiser la connexion DB
connectDB();

// Gestionnaires d'événements MongoDB
mongoose.connection.on('connected', () => {
  dbConnected = true;
  console.log('📡 MongoDB connected');
});

mongoose.connection.on('disconnected', () => {
  dbConnected = false;
  console.log('📡 MongoDB disconnected');
  
  // Tentative de reconnexion après 10 secondes
  setTimeout(() => {
    if (!dbConnected && connectionAttempts < maxRetries) {
      console.log('🔄 Attempting to reconnect to MongoDB...');
      connectDB();
    }
  }, 10000);
});

mongoose.connection.on('error', (error) => {
  dbConnected = false;
  console.error('❌ MongoDB error:', error.message);
});

// Rate limiter optimisé
const scanLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  message: { error: 'Too many scan requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting en développement
    return process.env.NODE_ENV !== 'production';
  }
});

// Routes principales
const smartlinkRoutes = require('../routes/smartlink.routes');
const analyticsRoutes = require('../routes/analytics.routes');
const adminRoutes = require('../routes/admin.routes');

app.use('/api/smartlinks', smartlinkRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// Route de scan avec gestion CORS explicite
app.post('/api/scan', scanLimiter, async (req, res) => {
  // Headers CORS explicites pour cette route critique
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(url)) {
      return res.status(400).json({ error: 'Valid URL is required' });
    }

    // Mock response optimisé
    const mockResponse = {
      entityUniqueId: `mock_${Date.now()}`,
      userCountry: 'FR',
      pageUrl: url,
      linksByPlatform: {
        spotify: {
          url: 'https://open.spotify.com/track/example',
          nativeAppUriMobile: 'spotify://track/example'
        },
        appleMusic: {
          url: 'https://music.apple.com/track/example',
          nativeAppUriMobile: 'music://track/example'
        },
        deezer: {
          url: 'https://www.deezer.com/track/example'
        },
        youtube: {
          url: 'https://www.youtube.com/watch?v=example'
        }
      },
      entitiesByUniqueId: {
        [`mock_${Date.now()}`]: {
          id: `mock_${Date.now()}`,
          type: 'song',
          title: 'Example Song',
          artistName: 'Example Artist',
          thumbnailUrl: 'https://via.placeholder.com/300x300?text=Album+Art'
        }
      }
    };

    res.json({
      success: true,
      data: mockResponse,
      platforms: Object.keys(mockResponse.linksByPlatform),
      metadata: Object.values(mockResponse.entitiesByUniqueId)[0]
    });
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ error: 'Failed to scan URL' });
  }
});

// Health check amélioré
app.get('/health', (req, res) => {
  const memoryUsage = process.memoryUsage();
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    memory: {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
      usage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100) + '%'
    },
    database: {
      connected: dbConnected,
      state: mongoose.connection.readyState,
      states: {
        0: 'disconnected',
        1: 'connected', 
        2: 'connecting',
        3: 'disconnecting'
      }
    },
    environment: process.env.NODE_ENV || 'development',
    cors: {
      origin: process.env.CORS_ORIGIN,
      configured: !!process.env.CORS_ORIGIN
    },
    port: PORT
  };
  
  res.json(health);
});

// Route de debug CORS
app.get('/api/debug/cors', (req, res) => {
  res.json({
    origin: req.headers.origin,
    corsOrigin: process.env.CORS_ORIGIN,
    headers: req.headers,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Route de test simple
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API accessible', 
    timestamp: new Date().toISOString(),
    origin: req.headers.origin 
  });
});

// Landing page route
app.get('/l/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const frontendUrl = process.env.CORS_ORIGIN || process.env.BASE_URL;
    res.redirect(`${frontendUrl}/link/${slug}`);
  } catch (error) {
    console.error('Landing page error:', error);
    res.status(500).send('Internal server error');
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Error handler global
app.use((error, req, res, next) => {
  console.error('Global error handler:', error.message);
  
  // Gérer les erreurs CORS spécifiquement
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Origin not allowed',
      origin: req.headers.origin,
      allowedOrigin: process.env.CORS_ORIGIN
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`🔄 ${signal} received, shutting down gracefully`);
  try {
    if (dbConnected) {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
    }
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
  }
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Démarrage du serveur
const server = app.listen(PORT, () => {
  console.log(`🚀 SmartLink API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
  console.log(`🌍 Base URL: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
  console.log(`🔗 CORS Origin: ${process.env.CORS_ORIGIN || 'Not set'}`);
  console.log(`📡 MongoDB: ${dbConnected ? 'Connected' : 'Connecting...'}`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

module.exports = app;
