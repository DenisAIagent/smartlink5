const GoogleAdsAccountService = require('../services/GoogleAdsAccountService');
const CacheService = require('../services/CacheService');

class AccountController {
  constructor() {
    this.accountService = new GoogleAdsAccountService();
    this.cache = new CacheService();
  }

  async getAccessibleAccounts(req, res) {
    try {
      const cacheKey = 'accessible_accounts';
      
      // Check cache (30 minutes)
      let accounts = await this.cache.get(cacheKey);
      
      if (!accounts) {
        console.log('Fetching accounts from Google Ads API...');
        accounts = await this.accountService.getAccessibleAccounts();
        
        // Enrichir avec des métriques de base
        const enrichedAccounts = await Promise.all(
          accounts.map(async (account) => {
            try {
              const metrics = await this.accountService.getAccountBasicMetrics(account.id);
              return {
                ...account,
                metrics: {
                  spend: `€${metrics.spend.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}`,
                  conversions: Math.round(metrics.conversions),
                  roas: metrics.roas.toFixed(1) + 'x',
                  isActive: metrics.spend > 0
                }
              };
            } catch (error) {
              console.warn(`Could not fetch metrics for account ${account.id}:`, error.message);
              return {
                ...account,
                metrics: {
                  spend: '€0',
                  conversions: 0,
                  roas: '0.0x',
                  isActive: false
                }
              };
            }
          })
        );
        
        accounts = enrichedAccounts;
        await this.cache.set(cacheKey, accounts, 1800); // 30 min cache
      }

      res.json({
        success: true,
        data: accounts,
        total: accounts.length
      });
    } catch (error) {
      console.error('Error fetching accessible accounts:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Unable to fetch Google Ads accounts',
        details: error.message 
      });
    }
  }

  async getAccountDetails(req, res) {
    try {
      const { customerId } = req.params;
      
      if (!customerId) {
        return res.status(400).json({
          success: false,
          error: 'Customer ID is required'
        });
      }

      const cacheKey = `account_details_${customerId}`;
      let details = await this.cache.get(cacheKey);
      
      if (!details) {
        const metrics = await this.accountService.getAccountBasicMetrics(customerId, 'LAST_30_DAYS');
        
        details = {
          customerId,
          formattedId: this.accountService.formatCustomerId(customerId),
          metrics,
          lastUpdated: new Date().toISOString()
        };
        
        await this.cache.set(cacheKey, details, 600); // 10 min cache
      }

      res.json({
        success: true,
        data: details
      });
    } catch (error) {
      console.error('Error fetching account details:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Unable to fetch account details',
        details: error.message 
      });
    }
  }

  async refreshAccounts(req, res) {
    try {
      // Clear cache
      await this.cache.del('accessible_accounts');
      
      // Re-fetch accounts
      const accounts = await this.accountService.getAccessibleAccounts();
      
      res.json({
        success: true,
        message: 'Accounts refreshed successfully',
        data: accounts,
        total: accounts.length
      });
    } catch (error) {
      console.error('Error refreshing accounts:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Unable to refresh accounts',
        details: error.message 
      });
    }
  }
}

module.exports = AccountController; 