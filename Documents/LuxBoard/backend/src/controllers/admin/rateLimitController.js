const rateLimitStatsService = require('../../services/rateLimitStatsService');
const { validateAdmin } = require('../../middleware/auth');

class RateLimitController {
  async getStats(req, res) {
    try {
      const { timeRange, endpoint } = req.query;
      const stats = await rateLimitStatsService.getStats(timeRange, endpoint);
      res.json(stats);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({
        error: 'Erreur lors de la récupération des statistiques'
      });
    }
  }

  async getEndpoints(req, res) {
    try {
      const endpoints = await rateLimitStatsService.getEndpoints();
      res.json(endpoints);
    } catch (error) {
      console.error('Erreur lors de la récupération des endpoints:', error);
      res.status(500).json({
        error: 'Erreur lors de la récupération des endpoints'
      });
    }
  }

  async cleanup(req, res) {
    try {
      await rateLimitStatsService.cleanup();
      res.json({ message: 'Nettoyage effectué avec succès' });
    } catch (error) {
      console.error('Erreur lors du nettoyage des données:', error);
      res.status(500).json({
        error: 'Erreur lors du nettoyage des données'
      });
    }
  }
}

const rateLimitController = new RateLimitController();

module.exports = (router) => {
  // Routes protégées par l'authentification admin
  router.get('/admin/rate-limit/stats', validateAdmin, rateLimitController.getStats);
  router.get('/admin/rate-limit/endpoints', validateAdmin, rateLimitController.getEndpoints);
  router.post('/admin/rate-limit/cleanup', validateAdmin, rateLimitController.cleanup);

  return router;
}; 