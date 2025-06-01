const salesforceService = require('./salesforceService');
const redis = require('../config/redis');

class VendorStatsService {
  constructor() {
    this.cacheKey = 'vendor:stats';
    this.cacheTTL = 300; // 5 minutes
  }

  async getStats() {
    try {
      // Vérifier le cache
      const cachedStats = await redis.get(this.cacheKey);
      if (cachedStats) {
        return JSON.parse(cachedStats);
      }

      // Récupérer les données de Salesforce
      const vendors = await salesforceService.searchVendors('');
      const cases = await Promise.all(
        vendors.map((vendor) => salesforceService.getVendorCases(vendor.id))
      );

      // Calculer les statistiques
      const stats = {
        totalVendors: vendors.length,
        openCases: 0,
        resolvedCases: 0,
        overdueCases: 0,
        caseTrend: [],
        typeDistribution: [],
        topVendors: [],
      };

      // Analyser les cas
      cases.forEach((vendorCases) => {
        vendorCases.forEach((case_) => {
          if (case_.status === 'open') {
            stats.openCases++;
          } else if (case_.status === 'resolved') {
            stats.resolvedCases++;
          }
          if (case_.isOverdue) {
            stats.overdueCases++;
          }
        });
      });

      // Calculer la tendance des cas
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      stats.caseTrend = last30Days.map((date) => ({
        date,
        open: cases.reduce(
          (count, vendorCases) =>
            count +
            vendorCases.filter(
              (case_) =>
                case_.status === 'open' &&
                case_.createdAt.startsWith(date)
            ).length,
          0
        ),
        resolved: cases.reduce(
          (count, vendorCases) =>
            count +
            vendorCases.filter(
              (case_) =>
                case_.status === 'resolved' &&
                case_.resolvedAt.startsWith(date)
            ).length,
          0
        ),
      }));

      // Calculer la distribution par type
      const typeCount = {};
      vendors.forEach((vendor) => {
        typeCount[vendor.type] = (typeCount[vendor.type] || 0) + 1;
      });

      stats.typeDistribution = Object.entries(typeCount).map(
        ([name, value]) => ({
          name,
          value,
        })
      );

      // Calculer les prestataires les plus actifs
      stats.topVendors = vendors
        .map((vendor) => {
          const vendorCases = cases.find(
            (cases) => cases[0]?.vendorId === vendor.id
          ) || [];
          const openCases = vendorCases.filter(
            (case_) => case_.status === 'open'
          ).length;
          const resolvedCases = vendorCases.filter(
            (case_) => case_.status === 'resolved'
          ).length;
          const totalCases = openCases + resolvedCases;
          const resolutionRate =
            totalCases > 0 ? (resolvedCases / totalCases) * 100 : 0;

          return {
            id: vendor.id,
            name: vendor.name,
            openCases,
            resolvedCases,
            resolutionRate: Math.round(resolutionRate),
          };
        })
        .sort((a, b) => b.openCases + b.resolvedCases - (a.openCases + a.resolvedCases))
        .slice(0, 5);

      // Mettre en cache les statistiques
      await redis.setex(this.cacheKey, this.cacheTTL, JSON.stringify(stats));

      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  async invalidateCache() {
    try {
      await redis.del(this.cacheKey);
    } catch (error) {
      console.error('Erreur lors de l\'invalidation du cache:', error);
      throw error;
    }
  }
}

module.exports = new VendorStatsService(); 