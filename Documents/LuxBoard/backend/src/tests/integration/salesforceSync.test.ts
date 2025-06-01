import { expect } from 'chai';
import sinon from 'sinon';
import { Redis } from 'ioredis';
import { jsforce } from 'jsforce';
import { salesforceSyncService } from '../../services/salesforceSyncService';
import { redisClient } from '../../config/redis';
import { salesforceClient } from '../../config/salesforce';

describe('Service de Synchronisation Salesforce', () => {
  let redisStub: sinon.SinonStub;
  let salesforceStub: sinon.SinonStub;

  beforeEach(() => {
    // Réinitialiser les stubs
    redisStub = sinon.stub(redisClient);
    salesforceStub = sinon.stub(salesforceClient);
  });

  afterEach(() => {
    // Restaurer les stubs
    sinon.restore();
  });

  describe('Démarrage de la synchronisation', () => {
    it('devrait démarrer la synchronisation avec succès', async () => {
      // Configuration des stubs
      redisStub.get.resolves(null);
      redisStub.set.resolves('OK');
      salesforceStub.login.resolves({ accessToken: 'mock_token' });

      // Exécution du test
      const result = await salesforceSyncService.startSync();

      // Vérifications
      expect(result).to.be.true;
      expect(redisStub.set.calledWith('salesforce:sync:status', 'in_progress')).to.be.true;
      expect(salesforceStub.login.called).to.be.true;
    });

    it('ne devrait pas démarrer une synchronisation si une autre est en cours', async () => {
      // Configuration des stubs
      redisStub.get.resolves('in_progress');

      // Exécution du test
      const result = await salesforceSyncService.startSync();

      // Vérifications
      expect(result).to.be.false;
      expect(redisStub.set.called).to.be.false;
    });
  });

  describe('Statut de la synchronisation', () => {
    it('devrait retourner le statut actuel de la synchronisation', async () => {
      // Configuration des stubs
      redisStub.get.resolves('in_progress');
      redisStub.get.withArgs('salesforce:sync:lastSync').resolves('2024-01-01T00:00:00Z');

      // Exécution du test
      const status = await salesforceSyncService.getSyncStatus();

      // Vérifications
      expect(status).to.deep.equal({
        status: 'in_progress',
        lastSync: '2024-01-01T00:00:00Z'
      });
    });

    it('devrait retourner le statut "idle" si aucune synchronisation n\'est en cours', async () => {
      // Configuration des stubs
      redisStub.get.resolves(null);

      // Exécution du test
      const status = await salesforceSyncService.getSyncStatus();

      // Vérifications
      expect(status).to.deep.equal({
        status: 'idle',
        lastSync: null
      });
    });
  });

  describe('Synchronisation des prestataires', () => {
    it('devrait synchroniser les prestataires avec succès', async () => {
      // Configuration des stubs
      const mockVendors = [
        { Id: '1', Name: 'Vendor 1', Type: 'Premium' },
        { Id: '2', Name: 'Vendor 2', Type: 'Standard' }
      ];
      salesforceStub.query.resolves({ records: mockVendors });
      redisStub.set.resolves('OK');

      // Exécution du test
      const vendors = await salesforceSyncService.syncVendors();

      // Vérifications
      expect(vendors).to.have.lengthOf(2);
      expect(vendors[0]).to.have.property('id', '1');
      expect(vendors[1]).to.have.property('id', '2');
      expect(redisStub.set.calledWith('salesforce:vendors', sinon.match.any)).to.be.true;
    });

    it('devrait gérer les erreurs lors de la synchronisation des prestataires', async () => {
      // Configuration des stubs
      salesforceStub.query.rejects(new Error('Erreur de connexion'));

      // Exécution du test
      try {
        await salesforceSyncService.syncVendors();
        expect.fail('Devrait avoir lancé une erreur');
      } catch (error) {
        expect(error.message).to.equal('Erreur lors de la synchronisation des prestataires');
      }
    });
  });

  describe('Synchronisation des cas', () => {
    it('devrait synchroniser les cas avec succès', async () => {
      // Configuration des stubs
      const mockCases = [
        { Id: '1', Subject: 'Case 1', Status: 'New' },
        { Id: '2', Subject: 'Case 2', Status: 'In Progress' }
      ];
      salesforceStub.query.resolves({ records: mockCases });
      redisStub.set.resolves('OK');

      // Exécution du test
      const cases = await salesforceSyncService.syncCases();

      // Vérifications
      expect(cases).to.have.lengthOf(2);
      expect(cases[0]).to.have.property('id', '1');
      expect(cases[1]).to.have.property('id', '2');
      expect(redisStub.set.calledWith('salesforce:cases', sinon.match.any)).to.be.true;
    });

    it('devrait gérer les erreurs lors de la synchronisation des cas', async () => {
      // Configuration des stubs
      salesforceStub.query.rejects(new Error('Erreur de connexion'));

      // Exécution du test
      try {
        await salesforceSyncService.syncCases();
        expect.fail('Devrait avoir lancé une erreur');
      } catch (error) {
        expect(error.message).to.equal('Erreur lors de la synchronisation des cas');
      }
    });
  });

  describe('Gestion du cache', () => {
    it('devrait mettre en cache les données de synchronisation', async () => {
      // Configuration des stubs
      const mockData = { status: 'completed', timestamp: '2024-01-01T00:00:00Z' };
      redisStub.set.resolves('OK');
      redisStub.get.resolves(JSON.stringify(mockData));

      // Exécution du test
      await salesforceSyncService.cacheSyncData(mockData);
      const cachedData = await salesforceSyncService.getCachedSyncData();

      // Vérifications
      expect(cachedData).to.deep.equal(mockData);
      expect(redisStub.set.calledWith('salesforce:sync:data', JSON.stringify(mockData))).to.be.true;
    });

    it('devrait gérer l\'invalidation du cache', async () => {
      // Configuration des stubs
      redisStub.del.resolves(1);

      // Exécution du test
      await salesforceSyncService.invalidateCache();

      // Vérifications
      expect(redisStub.del.calledWith('salesforce:sync:data')).to.be.true;
    });
  });
}); 