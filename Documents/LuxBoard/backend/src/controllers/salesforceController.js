const salesforceService = require('../services/salesforceService');
const { validateAdmin } = require('../middleware/auth');

class SalesforceController {
  async createVendor(req, res) {
    try {
      const vendorData = req.body;
      const result = await salesforceService.createVendor(vendorData);
      res.json(result);
    } catch (error) {
      console.error('Erreur lors de la création du prestataire:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async updateVendor(req, res) {
    try {
      const { vendorId } = req.params;
      const vendorData = req.body;
      const result = await salesforceService.updateVendor(vendorId, vendorData);
      res.json(result);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du prestataire:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getVendor(req, res) {
    try {
      const { vendorId } = req.params;
      const vendor = await salesforceService.getVendor(vendorId);
      res.json(vendor);
    } catch (error) {
      console.error('Erreur lors de la récupération du prestataire:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async searchVendors(req, res) {
    try {
      const { query } = req.query;
      const vendors = await salesforceService.searchVendors(query);
      res.json(vendors);
    } catch (error) {
      console.error('Erreur lors de la recherche des prestataires:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async createCase(req, res) {
    try {
      const caseData = req.body;
      const result = await salesforceService.createCase(caseData);
      res.json(result);
    } catch (error) {
      console.error('Erreur lors de la création du cas:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async updateCaseStatus(req, res) {
    try {
      const { caseId } = req.params;
      const { status } = req.body;
      const result = await salesforceService.updateCaseStatus(caseId, status);
      res.json(result);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut du cas:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getVendorCases(req, res) {
    try {
      const { vendorId } = req.params;
      const cases = await salesforceService.getVendorCases(vendorId);
      res.json(cases);
    } catch (error) {
      console.error('Erreur lors de la récupération des cas:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

const salesforceController = new SalesforceController();

module.exports = (router) => {
  // Routes protégées par l'authentification admin
  router.post('/vendors', validateAdmin, salesforceController.createVendor);
  router.put('/vendors/:vendorId', validateAdmin, salesforceController.updateVendor);
  router.get('/vendors/:vendorId', validateAdmin, salesforceController.getVendor);
  router.get('/vendors/search', validateAdmin, salesforceController.searchVendors);
  router.post('/cases', validateAdmin, salesforceController.createCase);
  router.put('/cases/:caseId/status', validateAdmin, salesforceController.updateCaseStatus);
  router.get('/vendors/:vendorId/cases', validateAdmin, salesforceController.getVendorCases);

  return router;
}; 