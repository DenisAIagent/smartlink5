const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration des variables d'environnement pour les tests
const testEnv = {
  TEST_REDIS_HOST: 'localhost',
  TEST_REDIS_PORT: '6379',
  TEST_REDIS_PASSWORD: '',
  TEST_REDIS_DB: '1',
  TEST_SALESFORCE_URL: 'https://test.salesforce.com',
  TEST_SALESFORCE_CLIENT_ID: 'test_client_id',
  TEST_SALESFORCE_CLIENT_SECRET: 'test_client_secret',
  TEST_SALESFORCE_USERNAME: 'test@example.com',
  TEST_SALESFORCE_PASSWORD: 'test_password',
  TEST_SALESFORCE_SECURITY_TOKEN: 'test_security_token',
  TEST_DB_HOST: 'localhost',
  TEST_DB_PORT: '5432',
  TEST_DB_USERNAME: 'test_user',
  TEST_DB_PASSWORD: 'test_password',
  TEST_DB_NAME: 'luxboard_test',
  TEST_MOCK_REDIS: 'true',
  TEST_MOCK_SALESFORCE: 'true',
  TEST_MOCK_DATABASE: 'true',
  TEST_TIMEOUT: '30000',
  TEST_HOOK_TIMEOUT: '60000',
  TEST_MOCHA_TIMEOUT: '120000',
  TEST_LOG_LEVEL: 'debug',
  TEST_LOG_FILE: 'test.log',
  TEST_JWT_SECRET: 'test_jwt_secret',
  TEST_JWT_EXPIRATION: '1h',
  TEST_EMAIL_HOST: 'smtp.test.com',
  TEST_EMAIL_PORT: '587',
  TEST_EMAIL_USER: 'test@example.com',
  TEST_EMAIL_PASSWORD: 'test_password',
  TEST_EMAIL_FROM: 'test@example.com'
};

// Fonction pour exécuter les tests
function runTests() {
  console.log('🚀 Démarrage des tests...');

  // Créer le dossier de logs s'il n'existe pas
  const logDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  // Configurer les options de Mocha
  const mochaOptions = [
    '--timeout', testEnv.TEST_MOCHA_TIMEOUT,
    '--exit',
    '--recursive',
    '--require', 'dotenv/config',
    '--require', 'ts-node/register',
    '--require', './src/tests/setup.ts',
    './src/tests/**/*.test.ts'
  ];

  // Exécuter les tests avec Mocha
  const testProcess = spawn('mocha', mochaOptions, {
    env: { ...process.env, ...testEnv },
    stdio: 'inherit'
  });

  testProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Tests terminés avec succès!');
    } else {
      console.error('❌ Tests échoués avec le code:', code);
      process.exit(code);
    }
  });

  testProcess.on('error', (error) => {
    console.error('❌ Erreur lors de l\'exécution des tests:', error);
    process.exit(1);
  });
}

// Exécuter les tests
runTests(); 