const express = require('express');
const AccountController = require('../controllers/AccountController');
const DashboardController = require('../controllers/DashboardController');

const router = express.Router();
const accountController = new AccountController();
const dashboardController = new DashboardController();

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'active', 
    activeSessions: 1,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Account management endpoints
router.get('/accounts', accountController.getAccessibleAccounts.bind(accountController));
router.get('/accounts/:customerId', accountController.getAccountDetails.bind(accountController));
router.post('/accounts/refresh', accountController.refreshAccounts.bind(accountController));

// Dashboard data endpoints
router.get('/metrics', dashboardController.getMainMetrics.bind(dashboardController));
router.get('/campaigns', dashboardController.getCampaignsList.bind(dashboardController));
router.get('/device-comparison', dashboardController.getDeviceComparison.bind(dashboardController));

// Test endpoint
router.get('/test/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const GoogleAdsService = require('../services/GoogleAdsService');
    const adsService = new GoogleAdsService();
    
    const metrics = await adsService.getAccountMetrics(customerId, 'LAST_7_DAYS');
    
    res.json({
      success: true,
      customerId,
      data: metrics,
      message: 'Test successful - Google Ads API connection working'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router; 