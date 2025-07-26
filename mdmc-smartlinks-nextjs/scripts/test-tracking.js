// Script de test pour valider le système de tracking double-moteur

const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Configuration des tests
const TEST_CONFIG = {
  smartlinkSlug: 'test-track-nextjs',
  platforms: ['spotify', 'apple_music', 'youtube_music', 'deezer'],
  userAgents: [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  ]
};

/**
 * Test de l'API de tracking des clics
 */
async function testClickTrackingAPI() {
  console.log('🎯 Test de l\'API de tracking des clics...');
  console.log('=======================================\\n');

  try {
    // Première étape: récupérer l'ID du SmartLink depuis la page
    console.log('1. Récupération de la page SmartLink...');
    const pageResponse = await axios.get(`${API_BASE_URL}/${TEST_CONFIG.smartlinkSlug}`);
    
    if (pageResponse.status !== 200) {
      throw new Error(`Page non trouvée: ${pageResponse.status}`);
    }
    
    console.log('✅ Page SmartLink récupérée avec succès');

    // Extraire l'ID du SmartLink depuis le HTML (simulation - en réalité il serait dans le JS)
    // ID MongoDB réel du SmartLink test-track-nextjs
    const smartlinkId = '68849fa48c1ecfaf66be44b6'; // ID MongoDB correct
    
    console.log(`🔗 SmartLink ID pour les tests: ${smartlinkId}`);

    // Test de chaque plateforme
    for (const platform of TEST_CONFIG.platforms) {
      console.log(`\\n2. Test du tracking pour: ${platform}`);
      console.log('-----------------------------------');

      const testData = {
        smartlinkId: smartlinkId,
        serviceName: platform,
        serviceDisplayName: platform.replace('_', ' ').toUpperCase(),
        userAgent: TEST_CONFIG.userAgents[Math.floor(Math.random() * TEST_CONFIG.userAgents.length)],
        timestamp: new Date().toISOString()
      };

      try {
        const startTime = Date.now();
        
        const response = await axios.post(`${API_BASE_URL}/api/track/click`, testData, {
          headers: {
            'Content-Type': 'application/json',
            'X-Session-ID': `test_session_${Date.now()}`
          },
          timeout: 5000
        });

        const responseTime = Date.now() - startTime;

        if (response.data.success) {
          console.log(`✅ ${platform}: Tracking réussi`);
          console.log(`   📊 Tracking ID: ${response.data.trackingId}`);
          console.log(`   🔗 Destination: ${response.data.destinationUrl}`);
          console.log(`   ⏱️  Temps de réponse: ${responseTime}ms`);
        } else {
          console.log(`❌ ${platform}: Tracking échoué`);
          console.log(`   💬 Message: ${response.data.message}`);
        }

      } catch (error) {
        console.log(`❌ ${platform}: Erreur API`);
        console.log(`   💬 Erreur: ${error.message}`);
        
        if (error.response) {
          console.log(`   📊 Status: ${error.response.status}`);
          console.log(`   📝 Data: ${JSON.stringify(error.response.data, null, 2)}`);
        }
      }

      // Délai entre les tests pour éviter le rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

  } catch (error) {
    console.error('❌ Erreur générale lors du test:', error.message);
  }
}

/**
 * Test de performance et de charge
 */
async function testPerformance() {
  console.log('\\n🚀 Test de performance...');
  console.log('=========================\\n');

  const numberOfRequests = 10;
  const platform = 'spotify';
  const smartlinkId = '6507f1f77bcf86cd799439011';

  console.log(`📊 Envoi de ${numberOfRequests} requêtes simultanées...`);

  const requests = Array.from({ length: numberOfRequests }, (_, index) => {
    return axios.post(`${API_BASE_URL}/api/track/click`, {
      smartlinkId: smartlinkId,
      serviceName: platform,
      serviceDisplayName: 'Spotify',
      userAgent: 'Test-Agent/1.0',
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': `perf_test_${index}_${Date.now()}`
      },
      timeout: 10000
    });
  });

  const startTime = Date.now();
  
  try {
    const results = await Promise.allSettled(requests);
    const totalTime = Date.now() - startTime;

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.data.success).length;
    const failed = results.length - successful;

    console.log(`\\n📈 Résultats du test de performance:`);
    console.log(`   ✅ Requêtes réussies: ${successful}/${numberOfRequests}`);
    console.log(`   ❌ Requêtes échouées: ${failed}/${numberOfRequests}`);
    console.log(`   ⏱️  Temps total: ${totalTime}ms`);
    console.log(`   📊 Temps moyen par requête: ${(totalTime / numberOfRequests).toFixed(2)}ms`);
    console.log(`   🔄 Taux de réussite: ${((successful / numberOfRequests) * 100).toFixed(1)}%`);

    // Afficher les erreurs éventuelles
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.log(`   ❌ Requête ${index + 1}: ${result.reason.message}`);
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors du test de performance:', error.message);
  }
}

/**
 * Test de validation des données
 */
async function testDataValidation() {
  console.log('\\n🔍 Test de validation des données...');
  console.log('===================================\\n');

  const testCases = [
    {
      name: 'smartlinkId manquant',
      data: {
        serviceName: 'spotify',
        serviceDisplayName: 'Spotify',
        userAgent: 'Test-Agent/1.0',
        timestamp: new Date().toISOString()
      },
      expectedStatus: 400
    },
    {
      name: 'serviceName manquant',
      data: {
        smartlinkId: '6507f1f77bcf86cd799439011',
        serviceDisplayName: 'Spotify',
        userAgent: 'Test-Agent/1.0',
        timestamp: new Date().toISOString()
      },
      expectedStatus: 400
    },
    {
      name: 'smartlinkId invalide (format)',
      data: {
        smartlinkId: 'invalid-id',
        serviceName: 'spotify',
        serviceDisplayName: 'Spotify',
        userAgent: 'Test-Agent/1.0',
        timestamp: new Date().toISOString()
      },
      expectedStatus: 400
    },
    {
      name: 'smartlinkId inexistant',
      data: {
        smartlinkId: '507f1f77bcf86cd799439011', // ID valide mais inexistant
        serviceName: 'spotify',
        serviceDisplayName: 'Spotify',
        userAgent: 'Test-Agent/1.0',
        timestamp: new Date().toISOString()
      },
      expectedStatus: 404
    }
  ];

  for (const testCase of testCases) {
    console.log(`🧪 Test: ${testCase.name}`);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/track/click`, testCase.data, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000,
        validateStatus: () => true // Accepter tous les codes de statut
      });

      if (response.status === testCase.expectedStatus) {
        console.log(`   ✅ Validation correcte (Status: ${response.status})`);
        console.log(`   💬 Message: ${response.data.message}`);
      } else {
        console.log(`   ❌ Validation incorrecte`);
        console.log(`   📊 Attendu: ${testCase.expectedStatus}, Reçu: ${response.status}`);
        console.log(`   💬 Message: ${response.data.message}`);
      }

    } catch (error) {
      console.log(`   ❌ Erreur lors du test: ${error.message}`);
    }

    console.log(''); // Ligne vide pour la lisibilité
  }
}

/**
 * Test de géolocalisation
 */
async function testGeolocation() {
  console.log('🌍 Test de géolocalisation...');
  console.log('============================\\n');

  const testIPs = [
    '8.8.8.8', // Google DNS (US)
    '1.1.1.1', // Cloudflare (US)
    '208.67.222.222', // OpenDNS (US)
    '127.0.0.1', // Localhost (should fallback)
    '192.168.1.1' // Private IP (should fallback)
  ];

  for (const ip of testIPs) {
    console.log(`🔍 Test géolocalisation pour IP: ${ip}`);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/track/click`, {
        smartlinkId: '6507f1f77bcf86cd799439011',
        serviceName: 'spotify',
        serviceDisplayName: 'Spotify',
        userAgent: 'Test-Agent/1.0',
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': ip // Simuler une IP différente
        },
        timeout: 10000
      });

      if (response.data.success) {
        console.log(`   ✅ Géolocalisation traitée`);
        console.log(`   🎯 Tracking ID: ${response.data.trackingId}`);
      } else {
        console.log(`   ❌ Erreur: ${response.data.message}`);
      }

    } catch (error) {
      console.log(`   ❌ Erreur réseau: ${error.message}`);
    }

    console.log('');
  }
}

/**
 * Exécution de tous les tests
 */
async function runAllTests() {
  console.log('🧪 DÉMARRAGE DES TESTS MDMC SMARTLINKS NEXT.JS');
  console.log('==============================================\\n');
  console.log(`🌐 URL de base: ${API_BASE_URL}`);
  console.log(`📅 Date: ${new Date().toISOString()}\\n`);

  try {
    await testClickTrackingAPI();
    await testDataValidation();
    await testPerformance();
    await testGeolocation();

    console.log('\\n🎉 TOUS LES TESTS TERMINÉS');
    console.log('===========================');
    console.log('✅ Vérifiez les résultats ci-dessus pour identifier les problèmes éventuels.');
    console.log('🔧 Consultez les logs du serveur Next.js pour plus de détails.');

  } catch (error) {
    console.error('❌ Erreur critique lors des tests:', error.message);
    process.exit(1);
  }
}

// Exécution des tests selon les arguments
if (require.main === module) {
  const testType = process.argv[2];
  
  switch (testType) {
    case 'api':
      testClickTrackingAPI();
      break;
    case 'performance':
      testPerformance();
      break;
    case 'validation':
      testDataValidation();
      break;
    case 'geo':
      testGeolocation();
      break;
    default:
      runAllTests();
  }
}

module.exports = {
  testClickTrackingAPI,
  testPerformance,
  testDataValidation,
  testGeolocation,
  runAllTests
};