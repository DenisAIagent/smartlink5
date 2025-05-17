require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');

// === INIT ===
const app = express();

// === REDIRECTIONS vers HTTPS et WWW ===
app.use((req, res, next) => {
  const host = req.headers.host;
  const protocol = req.headers['x-forwarded-proto'];

  // Redirige HTTP vers HTTPS
  if (protocol && protocol !== 'https') {
    return res.redirect(301, `https://www.mdmcmusicads.com${req.originalUrl}`);
  }

  // Redirige non-www vers www
  if (host === 'mdmcmusicads.com') {
    return res.redirect(301, `https://www.mdmcmusicads.com${req.originalUrl}`);
  }

  next();
});

// === MIDDLEWARES SÉCURITÉ ===
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());

// === RATE LIMITER ===
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
});
app.use('/api', limiter);

// === ROUTES ===
const artistRoutes = require('./routes/artists');
const smartLinkRoutes = require('./routes/smartLinkRoutes');
const reviewRoutes = require('./routes/reviews.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const marketingRoutes = require('./routes/marketing.routes');
const wordpressRoutes = require('./routes/wordpress.routes');
const landingPageRoutes = require('./routes/landingPage.routes');
const chatbotRoutes = require('./routes/chatbot.routes');

app.use('/api/v1/artists', artistRoutes);
app.use('/api/v1/smartlinks', smartLinkRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/marketing', marketingRoutes);
app.use('/api/v1/wordpress', wordpressRoutes);
app.use('/api/v1/landing-pages', landingPageRoutes);
app.use('/api/v1/chatbot', chatbotRoutes);

// === CHECK SANTÉ ===
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// === ERREURS ===
app.use((err, req, res, next) => {
  console.error('Erreur non gérée :', err);
  res.status(500).json({ success: false, error: 'Erreur interne du serveur.' });
});

// === DATABASE & DÉMARRAGE SERVEUR ===
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('🟢 Connecté à MongoDB');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Serveur lancé sur le port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Erreur de connexion MongoDB :', err);
  });
