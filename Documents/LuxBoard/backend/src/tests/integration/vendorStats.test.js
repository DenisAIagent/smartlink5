const { expect } = require('chai');
const vendorStatsService = require('../../services/vendorStatsService');
const salesforceService = require('../../services/salesforceService');
const redis = require('../../config/redis');

describe('Vendor Stats Integration Tests', () => {
  before(async () => {
    // Nettoyage du cache Redis
    await redis.flushall();
  });

  after(async () => {
    // Nettoyage final
    await redis.flushall();
  });

  describe('Stats Calculation', () => {
    it('should calculate vendor statistics', async () => {
      const stats = await vendorStatsService.getStats();
      
      expect(stats).to.have.property('totalVendors');
      expect(stats).to.have.property('openCases');
      expect(stats).to.have.property('resolvedCases');
      expect(stats).to.have.property('overdueCases');
      expect(stats).to.have.property('caseTrend');
      expect(stats).to.have.property('typeDistribution');
      expect(stats).to.have.property('topVendors');
    });

    it('should calculate case trends', async () => {
      const stats = await vendorStatsService.getStats();
      expect(stats.caseTrend).to.be.an('array');
      
      stats.caseTrend.forEach(trend => {
        expect(trend).to.have.property('date');
        expect(trend).to.have.property('open');
        expect(trend).to.have.property('resolved');
      });
    });

    it('should calculate type distribution', async () => {
      const stats = await vendorStatsService.getStats();
      expect(stats.typeDistribution).to.be.an('array');
      
      stats.typeDistribution.forEach(dist => {
        expect(dist).to.have.property('name');
        expect(dist).to.have.property('value');
      });
    });

    it('should identify top vendors', async () => {
      const stats = await vendorStatsService.getStats();
      expect(stats.topVendors).to.be.an('array');
      
      stats.topVendors.forEach(vendor => {
        expect(vendor).to.have.property('id');
        expect(vendor).to.have.property('name');
        expect(vendor).to.have.property('openCases');
        expect(vendor).to.have.property('resolvedCases');
        expect(vendor).to.have.property('resolutionRate');
      });
    });
  });

  describe('Cache Management', () => {
    it('should cache statistics', async () => {
      const stats = await vendorStatsService.getStats();
      const cachedStats = await redis.get('vendor:stats');
      expect(JSON.parse(cachedStats)).to.deep.equal(stats);
    });

    it('should invalidate cache', async () => {
      await vendorStatsService.invalidateCache();
      const cachedStats = await redis.get('vendor:stats');
      expect(cachedStats).to.be.null;
    });

    it('should refresh cache after invalidation', async () => {
      const stats = await vendorStatsService.getStats();
      expect(stats).to.not.be.null;
      
      const cachedStats = await redis.get('vendor:stats');
      expect(JSON.parse(cachedStats)).to.deep.equal(stats);
    });
  });

  describe('Error Handling', () => {
    it('should handle Salesforce connection errors', async () => {
      // Simuler une erreur de connexion
      const mockSalesforceService = {
        searchVendors: () => Promise.reject(new Error('Connection error'))
      };

      try {
        await vendorStatsService.getStats();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Erreur lors de la récupération des statistiques');
      }
    });

    it('should handle Redis errors', async () => {
      // Simuler une erreur Redis
      const mockRedis = {
        get: () => Promise.reject(new Error('Redis error'))
      };

      try {
        await vendorStatsService.getStats();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Erreur lors de la récupération des statistiques');
      }
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency after updates', async () => {
      // Créer un nouveau prestataire
      const vendorData = {
        name: 'Test Vendor',
        type: 'Restaurant',
        status: 'Active',
        description: 'Test vendor description'
      };

      const vendor = await salesforceService.createVendor(vendorData);
      
      // Vérifier que les statistiques sont mises à jour
      const stats = await vendorStatsService.getStats();
      expect(stats.totalVendors).to.be.greaterThan(0);
      
      // Créer un nouveau cas
      const caseData = {
        vendorId: vendor.accountId,
        subject: 'Test Case',
        description: 'Test case description',
        priority: 'High'
      };

      await salesforceService.createCase(caseData);
      
      // Vérifier que les statistiques sont mises à jour
      const updatedStats = await vendorStatsService.getStats();
      expect(updatedStats.openCases).to.be.greaterThan(0);
    });
  });
}); 