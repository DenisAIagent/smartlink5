const salesforceConfigService = require('../services/salesforceConfigService');
const { validateAdmin } = require('../middleware/auth');

class SalesforceConfigController {
  async getConfig(req, res) {
    try {
      const config = await salesforceConfigService.getConfig();
      res.json(config);
    } catch (error) {
      console.error('Erreur lors de la récupération de la configuration:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async updateConfig(req, res) {
    try {
      const config = await salesforceConfigService.updateConfig(req.body);
      res.json(config);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la configuration:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async testConnection(req, res) {
    try {
      const result = await salesforceConfigService.testConnection();
      res.json(result);
    } catch (error) {
      console.error('Erreur lors du test de connexion:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async invalidateCache(req, res) {
    try {
      await salesforceConfigService.invalidateCache();
      res.json({ message: 'Cache invalidé avec succès' });
    } catch (error) {
      console.error('Erreur lors de l\'invalidation du cache:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

const salesforceConfigController = new SalesforceConfigController();

module.exports = (router) => {
  // Routes protégées par l'authentification admin
  router.get(
    '/salesforce/config',
    validateAdmin,
    salesforceConfigController.getConfig
  );
  router.put(
    '/salesforce/config',
    validateAdmin,
    salesforceConfigController.updateConfig
  );
  router.post(
    '/salesforce/test-connection',
    validateAdmin,
    salesforceConfigController.testConnection
  );
  router.post(
    '/salesforce/invalidate-cache',
    validateAdmin,
    salesforceConfigController.invalidateCache
  );

  return router;
}; 