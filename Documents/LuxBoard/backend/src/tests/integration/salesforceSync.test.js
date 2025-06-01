const { expect } = require('chai');
const salesforceSyncService = require('../../services/salesforceSyncService');
const salesforceService = require('../../services/salesforceService');
const redis = require('../../config/redis');

describe('Salesforce Sync Integration Tests', () => {
  before(async () => {
    // Nettoyage du cache Redis
    await redis.flushall();
  });

  after(async () => {
    // Nettoyage final
    await redis.flushall();
  });

  describe('Sync Process', () => {
    it('should start sync process', async () => {
      const result = await salesforceSyncService.startSync();
      expect(result).to.have.property('success', true);
      expect(result).to.have.property('message', 'Synchronisation terminée avec succès');
    });

    it('should prevent concurrent syncs', async () => {
      try {
        await Promise.all([
          salesforceSyncService.startSync(),
          salesforceSyncService.startSync()
        ]);
        expect.fail('Should have thrown an error for concurrent syncs');
      } catch (error) {
        expect(error.message).to.include('Une synchronisation est déjà en cours');
      }
    });

    it('should update sync status', async () => {
      const status = await salesforceSyncService.getSyncStatus();
      expect(status).to.have.property('status');
      expect(status).to.have.property('lastSync');
      expect(new Date(status.lastSync)).to.be.instanceOf(Date);
    });
  });

  describe('Vendor Sync', () => {
    it('should sync vendors from Salesforce', async () => {
      const connection = await salesforceService.getConnection();
      await salesforceSyncService.syncVendors(connection);

      // Vérifier que les prestataires ont été synchronisés
      const vendors = await salesforceService.searchVendors('');
      expect(vendors).to.be.an('array');
      expect(vendors.length).to.be.greaterThan(0);
    });

    it('should handle vendor updates', async () => {
      const connection = await salesforceService.getConnection();
      const vendor = {
        Id: 'test-vendor-id',
        Name: 'Updated Test Vendor',
        Type: 'Restaurant',
        Status: 'Active',
        Description: 'Updated description'
      };

      await salesforceSyncService.processVendor(vendor);
      const updatedVendor = await salesforceService.getVendor(vendor.Id);
      expect(updatedVendor).to.have.property('Name', 'Updated Test Vendor');
    });
  });

  describe('Case Sync', () => {
    it('should sync cases from Salesforce', async () => {
      const connection = await salesforceService.getConnection();
      await salesforceSyncService.syncCases(connection);

      // Vérifier que les cas ont été synchronisés
      const cases = await salesforceService.getVendorCases('test-vendor-id');
      expect(cases).to.be.an('array');
    });

    it('should handle case updates', async () => {
      const connection = await salesforceService.getConnection();
      const case_ = {
        Id: 'test-case-id',
        CaseNumber: 'CASE-001',
        Subject: 'Updated Test Case',
        Description: 'Updated case description',
        Status: 'In Progress',
        Priority: 'High',
        AccountId: 'test-vendor-id'
      };

      await salesforceSyncService.processCase(case_);
      const updatedCase = await salesforceService.getVendorCases('test-vendor-id');
      expect(updatedCase.find(c => c.Id === 'test-case-id')).to.have.property('Status', 'In Progress');
    });
  });

  describe('Error Handling', () => {
    it('should handle sync errors gracefully', async () => {
      // Simuler une erreur de connexion
      const mockConnection = {
        query: () => Promise.reject(new Error('Connection error'))
      };

      try {
        await salesforceSyncService.syncVendors(mockConnection);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Erreur lors de la synchronisation des prestataires');
      }
    });

    it('should update status on sync failure', async () => {
      const status = await salesforceSyncService.getSyncStatus();
      expect(status).to.have.property('status');
      if (status.status === 'failed') {
        expect(status).to.have.property('error');
      }
    });
  });

  describe('Cache Management', () => {
    it('should cache sync status', async () => {
      const status = await salesforceSyncService.getSyncStatus();
      const cachedStatus = await redis.get('salesforce:sync:status');
      expect(JSON.parse(cachedStatus)).to.deep.equal(status);
    });

    it('should handle cache invalidation', async () => {
      await redis.del('salesforce:sync:status');
      const status = await salesforceSyncService.getSyncStatus();
      expect(status).to.be.null;
    });
  });
}); 