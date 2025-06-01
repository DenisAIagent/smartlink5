const vendorStatsService = require('../services/vendorStatsService');
const salesforceService = require('../services/salesforceService');
const { validateAdmin } = require('../middleware/auth');

class AdminController {
  async getStats(req, res) {
    try {
      const stats = await vendorStatsService.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getRecentCases(req, res) {
    try {
      // Récupérer les 10 derniers cas
      const result = await salesforceService.query(`
        SELECT Id, CaseNumber, Subject, Status, CreatedDate, Account.Name
        FROM Case
        ORDER BY CreatedDate DESC
        LIMIT 10
      `);

      const cases = result.records.map(case_ => ({
        id: case_.Id,
        reference: case_.CaseNumber,
        subject: case_.Subject,
        status: case_.Status,
        vendorName: case_.Account.Name,
        createdAt: case_.CreatedDate
      }));

      res.json(cases);
    } catch (error) {
      console.error('Erreur lors de la récupération des cas récents:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getAlerts(req, res) {
    try {
      // Récupérer les cas en retard
      const overdueCases = await salesforceService.query(`
        SELECT COUNT(Id)
        FROM Case
        WHERE Status != 'Closed'
        AND CreatedDate < LAST_N_DAYS:7
      `);

      // Récupérer les prestataires inactifs
      const inactiveVendors = await salesforceService.query(`
        SELECT COUNT(Id)
        FROM Account
        WHERE Type = 'Vendor'
        AND Status = 'Inactive'
      `);

      const alerts = [];

      if (overdueCases.records[0].expr0 > 0) {
        alerts.push({
          type: 'warning',
          title: 'Cas en retard',
          message: `${overdueCases.records[0].expr0} cas n'ont pas été traités depuis plus de 7 jours`
        });
      }

      if (inactiveVendors.records[0].expr0 > 0) {
        alerts.push({
          type: 'info',
          title: 'Prestataires inactifs',
          message: `${inactiveVendors.records[0].expr0} prestataires sont actuellement inactifs`
        });
      }

      res.json(alerts);
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

const adminController = new AdminController();

module.exports = (router) => {
  // Routes protégées par l'authentification admin
  router.get('/admin/stats', validateAdmin, adminController.getStats);
  router.get('/admin/recent-cases', validateAdmin, adminController.getRecentCases);
  router.get('/admin/alerts', validateAdmin, adminController.getAlerts);

  return router;
}; 