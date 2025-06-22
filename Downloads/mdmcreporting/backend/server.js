require('dotenv').config();

// Debug: Vérifier si les variables d'environnement sont chargées
console.log('🔍 Debug - Variables d\'environnement:');
console.log('CUSTOMER_ID:', process.env.CUSTOMER_ID ? '✅ Présent' : '❌ Manquant');
console.log('GOOGLE_ADS_CLIENT_ID:', process.env.GOOGLE_ADS_CLIENT_ID ? '✅ Présent' : '❌ Manquant');
console.log('GOOGLE_ADS_DEVELOPER_TOKEN:', process.env.GOOGLE_ADS_DEVELOPER_TOKEN ? '✅ Présent' : '❌ Manquant');
console.log('GOOGLE_ADS_REFRESH_TOKEN:', process.env.GOOGLE_ADS_REFRESH_TOKEN ? '✅ Présent' : '❌ Manquant');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const apiRoutes = require('./src/routes/api');

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send('MDMC Reporting Backend is running...');
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 