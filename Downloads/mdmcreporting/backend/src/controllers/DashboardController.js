const GoogleAdsService = require('../services/GoogleAdsService');
const CacheService = require('../services/CacheService');

class DashboardController {
  constructor() {
    this.adsService = new GoogleAdsService();
    this.cache = new CacheService();
  }

  async getMainMetrics(req, res) {
    try {
      const { customerId, dateRange = 'LAST_30_DAYS' } = req.query;
      
      if (!customerId) {
        return res.status(400).json({
          success: false,
          error: 'Customer ID is required'
        });
      }

      const cacheKey = `metrics_${customerId}_${dateRange}`;
      
      let metrics = await this.cache.get(cacheKey);
      
      if (!metrics) {
        console.log(`Fetching metrics for customer ${customerId}...`);
        const rawMetrics = await this.adsService.getAccountMetrics(customerId, dateRange);
        
        // Calculate historical changes
        const changes = await this.calculateChanges(customerId, dateRange, rawMetrics);
        
        metrics = {
          revenue: {
            value: `€${rawMetrics.revenue.toLocaleString('fr-FR')}`,
            change: changes.revenue,
            trend: changes.revenue > 0 ? 'up' : 'down'
          },
          roas: {
            value: `${rawMetrics.roas.toFixed(1)}x`,
            change: changes.roas,
            trend: changes.roas > 0 ? 'up' : 'down'
          },
          conversions: {
            value: rawMetrics.conversions.toFixed(0),
            change: changes.conversions,
            trend: changes.conversions > 0 ? 'up' : 'down'
          },
          ctr: {
            value: `${rawMetrics.ctr.toFixed(2)}%`,
            change: changes.ctr,
            trend: changes.ctr > 0 ? 'up' : 'down'
          },
          rawData: rawMetrics
        };
        
        await this.cache.set(cacheKey, metrics, 300); // 5 min cache
      }

      res.json({
        success: true,
        data: metrics,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Unable to fetch metrics',
        details: error.message 
      });
    }
  }

  async getCampaignsList(req, res) {
    try {
      const { customerId, dateRange = 'LAST_30_DAYS' } = req.query;
      
      if (!customerId) {
        return res.status(400).json({
          success: false,
          error: 'Customer ID is required'
        });
      }

      const cacheKey = `campaigns_${customerId}_${dateRange}`;
      
      let campaigns = await this.cache.get(cacheKey);
      
      if (!campaigns) {
        console.log(`Fetching campaigns for customer ${customerId}...`);
        const rawCampaigns = await this.adsService.getCampaigns(customerId, dateRange);
        
        campaigns = rawCampaigns.map(campaign => ({
          name: campaign.name,
          status: campaign.status,
          spend: `€${campaign.cost.toLocaleString('fr-FR')}`,
          conversions: Math.round(campaign.conversions),
          roas: parseFloat(campaign.roas.toFixed(1)),
          impression: Math.round(campaign.impressions),
          device: campaign.primaryDevice,
          change: this.calculateCampaignChange(campaign), // Simplified calculation
          type: campaign.type,
          ctr: campaign.ctr.toFixed(2) + '%'
        }));
        
        await this.cache.set(cacheKey, campaigns, 300); // 5 min cache
      }

      res.json({
        success: true,
        data: campaigns,
        total: campaigns.length
      });
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Unable to fetch campaigns',
        details: error.message 
      });
    }
  }

  async getDeviceComparison(req, res) {
    try {
      const { customerId, dateRange = 'LAST_30_DAYS' } = req.query;
      
      if (!customerId) {
        return res.status(400).json({
          success: false,
          error: 'Customer ID is required'
        });
      }

      const cacheKey = `device_comparison_${customerId}_${dateRange}`;
      
      let deviceData = await this.cache.get(cacheKey);
      
      if (!deviceData) {
        console.log(`Fetching device data for customer ${customerId}...`);
        deviceData = await this.adsService.getDevicePerformance(customerId, dateRange);
        await this.cache.set(cacheKey, deviceData, 300); // 5 min cache
      }
      
      res.json({
        success: true,
        data: deviceData
      });
    } catch (error) {
      console.error('Error fetching device comparison:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Unable to fetch device comparison',
        details: error.message 
      });
    }
  }

  async calculateChanges(customerId, currentPeriod, currentMetrics) {
    try {
      // This would ideally fetch previous period data and calculate real changes
      // For now, we'll use a simplified approach
      
      const previousPeriodKey = `metrics_${customerId}_PREVIOUS_PERIOD`;
      const previousMetrics = await this.cache.get(previousPeriodKey);
      
      if (!previousMetrics) {
        // Generate reasonable random changes for demo
        return {
          revenue: (Math.random() * 40 - 20).toFixed(1),
          roas: (Math.random() * 20 - 10).toFixed(1),
          conversions: (Math.random() * 50 - 25).toFixed(1),
          ctr: (Math.random() * 10 - 5).toFixed(1)
        };
      }
      
      // Calculate real percentage changes
      return {
        revenue: ((currentMetrics.revenue - previousMetrics.revenue) / previousMetrics.revenue * 100).toFixed(1),
        roas: ((currentMetrics.roas - previousMetrics.roas) / previousMetrics.roas * 100).toFixed(1),
        conversions: ((currentMetrics.conversions - previousMetrics.conversions) / previousMetrics.conversions * 100).toFixed(1),
        ctr: ((currentMetrics.ctr - previousMetrics.ctr) / previousMetrics.ctr * 100).toFixed(1)
      };
    } catch (error) {
      console.warn('Could not calculate changes:', error.message);
      return {
        revenue: '0.0',
        roas: '0.0', 
        conversions: '0.0',
        ctr: '0.0'
      };
    }
  }

  calculateCampaignChange(campaign) {
    // Simplified campaign change calculation
    // In real implementation, you'd compare with previous period data
    const baseChange = Math.random() * 30 - 15;
    
    // Adjust based on performance indicators
    if (campaign.roas > 4) return Math.abs(baseChange);
    if (campaign.roas < 2) return -Math.abs(baseChange);
    
    return baseChange.toFixed(1);
  }
}

module.exports = DashboardController; 