const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Initialiser le service de notifications
const notificationService = require('./services/notificationService');
notificationService.initialize(server);

// Middleware de sécurité
app.use(helmet());
app.use(compression());

// Configuration CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite de 100 requêtes par IP
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});
app.use('/api/', limiter);

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined'));

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static('uploads'));

// Routes de base
app.get('/health', (req, res) => {
  const healthStatus = {
    status: 'OK',
    message: 'LuxBoard API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    mongodb: {
      connected: mongoose.connection.readyState === 1,
      state: mongoose.connection.readyState,
      host: mongoose.connection.host || 'not connected'
    },
    uptime: process.uptime(),
    memory: process.memoryUsage()
  };
  
  console.log('📊 Health check requested:', healthStatus);
  res.status(200).json(healthStatus);
});

// Servir les fichiers statiques (images uploadées)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/providers', require('./routes/providers'));
app.use('/api/offers', require('./routes/offers'));
app.use('/api/events', require('./routes/events'));
app.use('/api/users', require('./routes/users'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/images', require('./routes/images'));

// Servir les fichiers statiques du frontend (en production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  // Pour toutes les routes non-API, servir l'index.html du frontend
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
    } else {
      res.status(404).json({ message: 'Route API non trouvée' });
    }
  });
} else {
  // En développement, route 404 pour les API seulement
  app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'Route API non trouvée' });
  });
}

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Connexion à MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/luxboard';
    console.log('🔄 Tentative de connexion à MongoDB...');
    console.log('📍 URI MongoDB:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Masquer les credentials
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    
    // En production, continuer sans MongoDB pour permettre le healthcheck
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️  Mode production: Démarrage sans MongoDB pour healthcheck');
      return false;
    } else {
      process.exit(1);
    }
  }
};

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

const startServer = async () => {
  console.log('🚀 Démarrage du serveur LuxBoard...');
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 Port: ${PORT}`);
  console.log(`🔧 Host: ${HOST}`);
  
  const mongoConnected = await connectDB();
  
  server.listen(PORT, HOST, () => {
    console.log(`✅ Serveur LuxBoard démarré sur ${HOST}:${PORT}`);
    console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
    console.log(`🔔 Notifications en temps réel activées`);
    console.log(`🗄️  MongoDB: ${mongoConnected ? 'Connecté' : 'Déconnecté'}`);
  });
  
  // Gestion des erreurs du serveur
  server.on('error', (error) => {
    console.error('❌ Erreur du serveur:', error);
  });
};

startServer();

module.exports = app;

