const axios = require('axios');

// Configuration de base
const API_BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let adminToken = '';

// Fonction utilitaire pour les requêtes
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

const testAPI = async () => {
  console.log('🧪 Test de l\'API LuxBoard\n');

  try {
    // 1. Test de santé
    console.log('1. Test de l\'endpoint de santé...');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ Santé:', healthResponse.data.message);

    // 2. Test d'inscription
    console.log('\n2. Test d\'inscription...');
    const registerData = {
      email: 'admin@luxboard.com',
      password: 'AdminPassword123',
      confirmPassword: 'AdminPassword123',
      firstName: 'Admin',
      lastName: 'LuxBoard'
    };

    try {
      const registerResponse = await api.post('/auth/register', registerData);
      console.log('✅ Inscription réussie:', registerResponse.data.data.user.email);
      adminToken = registerResponse.data.data.tokens.accessToken;
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️ Utilisateur déjà existant, tentative de connexion...');
        
        // 3. Test de connexion
        const loginResponse = await api.post('/auth/login', {
          email: registerData.email,
          password: registerData.password
        });
        console.log('✅ Connexion réussie:', loginResponse.data.data.user.email);
        adminToken = loginResponse.data.data.tokens.accessToken;
      } else {
        throw error;
      }
    }

    // Mettre à jour le token pour les prochaines requêtes
    authToken = adminToken;

    // 4. Test du profil utilisateur
    console.log('\n3. Test du profil utilisateur...');
    const profileResponse = await api.get('/auth/profile');
    console.log('✅ Profil récupéré:', profileResponse.data.data.user.fullName);

    // 5. Test de création d'un prestataire
    console.log('\n4. Test de création d\'un prestataire...');
    const providerData = {
      name: 'Restaurant Test API',
      type: 'restaurant',
      description: 'Un restaurant de test créé via l\'API pour valider les fonctionnalités',
      address: {
        street: '123 Rue de l\'API',
        city: 'Paris',
        postalCode: '75001',
        country: 'France'
      },
      contact: {
        email: 'contact@restaurant-api.com',
        phone: '0123456789'
      },
      pricing: {
        level: '€€',
        description: 'Cuisine moderne et accessible'
      },
      tags: ['moderne', 'api', 'test']
    };

    const providerResponse = await api.post('/providers', providerData);
    console.log('✅ Prestataire créé:', providerResponse.data.data.provider.name);
    const providerId = providerResponse.data.data.provider._id;

    // 6. Test de récupération des prestataires
    console.log('\n5. Test de récupération des prestataires...');
    const providersResponse = await api.get('/providers?limit=5');
    console.log('✅ Prestataires récupérés:', providersResponse.data.data.providers.length);

    // 7. Test de création d'une offre
    console.log('\n6. Test de création d\'une offre...');
    const offerData = {
      title: 'Offre API Test - 15% de réduction',
      description: 'Une offre de test créée via l\'API pour valider les fonctionnalités',
      provider: providerId,
      type: 'discount',
      value: {
        type: 'percentage',
        amount: 15,
        description: '15% de réduction sur l\'addition'
      },
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      conditions: 'Valable du lundi au vendredi, sur présentation de ce code',
      code: 'API15',
      maxUses: 50,
      tags: ['api', 'test', 'reduction']
    };

    const offerResponse = await api.post('/offers', offerData);
    console.log('✅ Offre créée:', offerResponse.data.data.offer.title);
    const offerId = offerResponse.data.data.offer._id;

    // 8. Test de récupération des offres
    console.log('\n7. Test de récupération des offres...');
    const offersResponse = await api.get('/offers?limit=5');
    console.log('✅ Offres récupérées:', offersResponse.data.data.offers.length);

    // 9. Test de création d'un événement
    console.log('\n8. Test de création d\'un événement...');
    const eventData = {
      title: 'Événement API Test',
      description: 'Un événement de test créé via l\'API pour valider les fonctionnalités',
      type: 'conference',
      dates: [{
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Session principale'
      }],
      location: {
        name: 'Centre API Test',
        address: '456 Avenue de l\'API',
        city: 'Paris',
        postalCode: '75002',
        country: 'France'
      },
      pricing: {
        isFree: false,
        basePrice: 99,
        currency: 'EUR',
        description: 'Tarif early bird'
      },
      capacity: {
        max: 50
      },
      organizer: {
        name: 'LuxBoard API',
        description: 'Tests automatisés de l\'API'
      },
      tags: ['api', 'test', 'conference']
    };

    const eventResponse = await api.post('/events', eventData);
    console.log('✅ Événement créé:', eventResponse.data.data.event.title);

    // 10. Test de récupération des événements
    console.log('\n9. Test de récupération des événements...');
    const eventsResponse = await api.get('/events?limit=5');
    console.log('✅ Événements récupérés:', eventsResponse.data.data.events.length);

    // 11. Test d'utilisation d'une offre
    console.log('\n10. Test d\'utilisation d\'une offre...');
    const useOfferResponse = await api.post(`/offers/${offerId}/use`);
    console.log('✅ Offre utilisée:', useOfferResponse.data.data.offer.currentUses, 'utilisations');

    // 12. Test de recherche
    console.log('\n11. Test de recherche...');
    const searchResponse = await api.get('/providers?q=test&limit=3');
    console.log('✅ Recherche effectuée:', searchResponse.data.data.providers.length, 'résultats');

    console.log('\n🎉 Tous les tests API sont passés avec succès !');

  } catch (error) {
    console.error('\n❌ Erreur lors du test de l\'API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message || error.response.data);
      if (error.response.data.errors) {
        console.error('Erreurs de validation:', error.response.data.errors);
      }
    } else {
      console.error('Erreur:', error.message);
    }
  }
};

// Fonction pour attendre que le serveur soit prêt
const waitForServer = async (maxAttempts = 10) => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await axios.get('http://localhost:5000/health');
      return true;
    } catch (error) {
      console.log(`Tentative ${i + 1}/${maxAttempts} - Serveur non prêt, attente...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return false;
};

// Exécuter les tests
const runTests = async () => {
  console.log('🔄 Attente du démarrage du serveur...\n');
  
  const serverReady = await waitForServer();
  if (!serverReady) {
    console.error('❌ Le serveur n\'est pas accessible après 20 secondes');
    process.exit(1);
  }

  await testAPI();
};

// Installer axios si nécessaire
const checkDependencies = async () => {
  try {
    require('axios');
  } catch (error) {
    console.log('📦 Installation d\'axios...');
    const { execSync } = require('child_process');
    execSync('npm install axios', { stdio: 'inherit' });
    console.log('✅ Axios installé\n');
  }
};

// Point d'entrée
const main = async () => {
  await checkDependencies();
  await runTests();
};

main();

