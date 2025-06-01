const vendorStatsService = require('../services/vendorStatsService');
const { validateAdmin } = require('../middleware/auth');

class VendorStatsController {
  async getStats(req, res) {
    try {
      const stats = await vendorStatsService.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async invalidateCache(req, res) {
    try {
      await vendorStatsService.invalidateCache();
      res.json({ message: 'Cache invalidé avec succès' });
    } catch (error) {
      console.error('Erreur lors de l\'invalidation du cache:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

const vendorStatsController = new VendorStatsController();

module.exports = (router) => {
  // Routes protégées par l'authentification admin
  router.get('/vendors/stats', validateAdmin, vendorStatsController.getStats);
  router.post(
    '/vendors/stats/invalidate-cache',
    validateAdmin,
    vendorStatsController.invalidateCache
  );

  return router;
}; 