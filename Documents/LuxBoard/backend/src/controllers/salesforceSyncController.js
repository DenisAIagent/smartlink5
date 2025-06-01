const salesforceSyncService = require('../services/salesforceSyncService');
const { validateAdmin } = require('../middleware/auth');

class SalesforceSyncController {
  async startSync(req, res) {
    try {
      const result = await salesforceSyncService.startSync();
      res.json(result);
    } catch (error) {
      console.error('Erreur lors du démarrage de la synchronisation:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getSyncStatus(req, res) {
    try {
      const status = await salesforceSyncService.getSyncStatus();
      res.json(status);
    } catch (error) {
      console.error('Erreur lors de la récupération du statut:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

const salesforceSyncController = new SalesforceSyncController();

module.exports = (router) => {
  // Routes protégées par l'authentification admin
  router.post(
    '/salesforce/sync/start',
    validateAdmin,
    salesforceSyncController.startSync
  );
  router.get(
    '/salesforce/sync/status',
    validateAdmin,
    salesforceSyncController.getSyncStatus
  );

  return router;
}; 