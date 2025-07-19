const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const apiRoutes = require('./routes/api');
const redirectRoutes = require('./routes/redirect');

const app = express();
const PORT = process.env.PORT || 3001;

// Connexion à la base de données
connectDB();

// Middlewares
app.use(cors({
  origin: '*', // Permettre toutes les origines pour le développement
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', apiRoutes);
app.use('/r', redirectRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({
    message: 'SmartLinks API is running!',
    version: '1.0.0',
    endpoints: {
      scan: 'POST /api/scan',
      createLink: 'POST /api/links',
      getLinks: 'GET /api/links',
      getLink: 'GET /api/links/:slug',
      redirect: 'GET /r/:slug/:platform'
    }
  });
});

// Middleware de gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée'
  });
});

// Middleware de gestion des erreurs globales
app.use((error, req, res, next) => {
  console.error('Erreur globale:', error);
  res.status(500).json({
    error: 'Erreur interne du serveur'
  });
});

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`API disponible sur http://localhost:${PORT}`);
});

module.exports = app;

