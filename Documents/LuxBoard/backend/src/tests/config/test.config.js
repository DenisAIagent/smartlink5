require('dotenv').config({ path: '.env.test' });

module.exports = {
  // Configuration Redis pour les tests
  redis: {
    host: process.env.TEST_REDIS_HOST || 'localhost',
    port: process.env.TEST_REDIS_PORT || 6379,
    password: process.env.TEST_REDIS_PASSWORD,
    db: process.env.TEST_REDIS_DB || 1
  },

  // Configuration Salesforce pour les tests
  salesforce: {
    instanceUrl: process.env.TEST_SALESFORCE_URL,
    clientId: process.env.TEST_SALESFORCE_CLIENT_ID,
    clientSecret: process.env.TEST_SALESFORCE_CLIENT_SECRET,
    username: process.env.TEST_SALESFORCE_USERNAME,
    password: process.env.TEST_SALESFORCE_PASSWORD,
    securityToken: process.env.TEST_SALESFORCE_SECURITY_TOKEN
  },

  // Configuration de la base de données pour les tests
  database: {
    host: process.env.TEST_DB_HOST || 'localhost',
    port: process.env.TEST_DB_PORT || 5432,
    username: process.env.TEST_DB_USERNAME,
    password: process.env.TEST_DB_PASSWORD,
    database: process.env.TEST_DB_NAME || 'luxboard_test'
  },

  // Configuration des timeouts pour les tests
  timeouts: {
    test: 30000, // 30 secondes
    hook: 60000, // 1 minute
    mocha: 120000 // 2 minutes
  },

  // Configuration des mocks
  mocks: {
    enableRedisMock: process.env.TEST_MOCK_REDIS === 'true',
    enableSalesforceMock: process.env.TEST_MOCK_SALESFORCE === 'true',
    enableDatabaseMock: process.env.TEST_MOCK_DATABASE === 'true'
  },

  // Configuration des données de test
  testData: {
    vendor: {
      name: 'Test Vendor',
      type: 'Restaurant',
      status: 'Active',
      description: 'Test vendor description'
    },
    case: {
      subject: 'Test Case',
      description: 'Test case description',
      priority: 'High'
    }
  }
}; 