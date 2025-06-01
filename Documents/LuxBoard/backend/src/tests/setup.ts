import { config } from 'dotenv';
import path from 'path';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { Redis } from 'ioredis';
import { jsforce } from 'jsforce';
import { Pool } from 'pg';

// Charger les variables d'environnement de test
config({ path: path.join(__dirname, '../../.env.test') });

// Configuration de Chai
chai.use(chaiAsPromised);
chai.use(sinonChai);

// Configuration globale pour les tests
global.expect = chai.expect;
global.sinon = sinon;

// Configuration des timeouts
const TEST_TIMEOUT = parseInt(process.env.TEST_TIMEOUT || '30000');
const TEST_HOOK_TIMEOUT = parseInt(process.env.TEST_HOOK_TIMEOUT || '60000');

// Configuration des mocks
const shouldMockRedis = process.env.TEST_MOCK_REDIS === 'true';
const shouldMockSalesforce = process.env.TEST_MOCK_SALESFORCE === 'true';
const shouldMockDatabase = process.env.TEST_MOCK_DATABASE === 'true';

// Mock Redis si nécessaire
if (shouldMockRedis) {
  const mockRedis = {
    get: sinon.stub().resolves(null),
    set: sinon.stub().resolves('OK'),
    del: sinon.stub().resolves(1),
    flushall: sinon.stub().resolves('OK')
  };
  sinon.stub(Redis.prototype, 'get').callsFake(mockRedis.get);
  sinon.stub(Redis.prototype, 'set').callsFake(mockRedis.set);
  sinon.stub(Redis.prototype, 'del').callsFake(mockRedis.del);
  sinon.stub(Redis.prototype, 'flushall').callsFake(mockRedis.flushall);
}

// Mock Salesforce si nécessaire
if (shouldMockSalesforce) {
  const mockSalesforce = {
    login: sinon.stub().resolves({ accessToken: 'mock_token' }),
    query: sinon.stub().resolves({ records: [] }),
    sobject: sinon.stub().returns({
      create: sinon.stub().resolves({ id: 'mock_id' }),
      update: sinon.stub().resolves({ id: 'mock_id' }),
      retrieve: sinon.stub().resolves({ Id: 'mock_id' })
    })
  };
  sinon.stub(jsforce.Connection.prototype, 'login').callsFake(mockSalesforce.login);
  sinon.stub(jsforce.Connection.prototype, 'query').callsFake(mockSalesforce.query);
  sinon.stub(jsforce.Connection.prototype, 'sobject').callsFake(mockSalesforce.sobject);
}

// Mock Database si nécessaire
if (shouldMockDatabase) {
  const mockPool = {
    query: sinon.stub().resolves({ rows: [] }),
    connect: sinon.stub().resolves({
      query: sinon.stub().resolves({ rows: [] }),
      release: sinon.stub()
    })
  };
  sinon.stub(Pool.prototype, 'query').callsFake(mockPool.query);
  sinon.stub(Pool.prototype, 'connect').callsFake(mockPool.connect);
}

// Configuration des hooks Mocha
beforeEach(() => {
  // Réinitialiser tous les stubs avant chaque test
  sinon.reset();
});

afterEach(() => {
  // Restaurer tous les stubs après chaque test
  sinon.restore();
});

// Configuration des timeouts Mocha
before(function() {
  this.timeout(TEST_HOOK_TIMEOUT);
});

after(function() {
  this.timeout(TEST_HOOK_TIMEOUT);
});

// Configuration des timeouts pour les tests
beforeEach(function() {
  this.timeout(TEST_TIMEOUT);
}); 