const { GoogleAdsApi, enums } = require('google-ads-api');

class GoogleAdsService {
  constructor() {
    this.client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    });
  }

  async getCustomer(customerId) {
    return this.client.Customer({
      customer_id: customerId,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    });
  }

  async getAccountMetrics(customerId, dateRange = 'LAST_30_DAYS') {
    const customer = await this.getCustomer(customerId);
    
    const query = `
      SELECT 
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value,
        metrics.clicks,
        metrics.impressions,
        metrics.ctr,
        metrics.average_cpc,
        metrics.conversion_rate
      FROM account_performance_view 
      WHERE segments.date DURING ${dateRange}
    `;

    const results = await customer.query(query);
    return this.formatMetrics(results);
  }

  async getCampaigns(customerId, dateRange = 'LAST_30_DAYS') {
    const customer = await this.getCustomer(customerId);
    
    const query = `
      SELECT 
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value,
        metrics.clicks,
        metrics.impressions,
        metrics.ctr,
        segments.device
      FROM campaign 
      WHERE segments.date DURING ${dateRange}
        AND campaign.status = 'ENABLED'
      ORDER BY metrics.cost_micros DESC
    `;

    const results = await customer.query(query);
    return this.formatCampaigns(results);
  }

  async getDevicePerformance(customerId, dateRange = 'LAST_30_DAYS') {
    const customer = await this.getCustomer(customerId);
    
    const query = `
      SELECT 
        segments.device,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value,
        metrics.clicks,
        metrics.impressions,
        metrics.ctr
      FROM campaign 
      WHERE segments.date DURING ${dateRange}
        AND campaign.status = 'ENABLED'
    `;

    const results = await customer.query(query);
    return this.formatDeviceMetrics(results);
  }

  formatMetrics(results) {
    let totalCost = 0;
    let totalConversions = 0;
    let totalConversionsValue = 0;
    let totalClicks = 0;
    let totalImpressions = 0;

    results.forEach(row => {
      totalCost += parseInt(row.metrics.cost_micros) / 1000000;
      totalConversions += parseFloat(row.metrics.conversions);
      totalConversionsValue += parseInt(row.metrics.conversions_value) / 1000000;
      totalClicks += parseInt(row.metrics.clicks);
      totalImpressions += parseInt(row.metrics.impressions);
    });

    const roas = totalCost > 0 ? totalConversionsValue / totalCost : 0;
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgCpc = totalClicks > 0 ? totalCost / totalClicks : 0;

    return {
      revenue: totalConversionsValue,
      roas: roas,
      conversions: totalConversions,
      ctr: ctr,
      cost: totalCost,
      clicks: totalClicks,
      impressions: totalImpressions,
      avgCpc: avgCpc
    };
  }

  formatCampaigns(results) {
    const campaigns = {};
    
    results.forEach(row => {
      const campaignId = row.campaign.id;
      if (!campaigns[campaignId]) {
        campaigns[campaignId] = {
          id: campaignId,
          name: row.campaign.name,
          status: row.campaign.status.toLowerCase(),
          type: row.campaign.advertising_channel_type,
          cost: 0,
          conversions: 0,
          conversionsValue: 0,
          clicks: 0,
          impressions: 0,
          devices: {}
        };
      }

      const campaign = campaigns[campaignId];
      const device = row.segments.device.toLowerCase();
      
      campaign.cost += parseInt(row.metrics.cost_micros) / 1000000;
      campaign.conversions += parseFloat(row.metrics.conversions);
      campaign.conversionsValue += parseInt(row.metrics.conversions_value) / 1000000;
      campaign.clicks += parseInt(row.metrics.clicks);
      campaign.impressions += parseInt(row.metrics.impressions);
      
      if (!campaign.devices[device]) {
        campaign.devices[device] = 0;
      }
      campaign.devices[device] += campaign.cost;
    });

    return Object.values(campaigns).map(campaign => ({
      ...campaign,
      roas: campaign.cost > 0 ? campaign.conversionsValue / campaign.cost : 0,
      ctr: campaign.impressions > 0 ? (campaign.clicks / campaign.impressions) * 100 : 0,
      primaryDevice: Object.keys(campaign.devices).length > 0 ? 
        Object.keys(campaign.devices).reduce((a, b) => 
          campaign.devices[a] > campaign.devices[b] ? a : b
        ) : 'desktop'
    }));
  }

  formatDeviceMetrics(results) {
    const devices = {};
    
    results.forEach(row => {
      const device = row.segments.device.toLowerCase();
      
      if (!devices[device]) {
        devices[device] = {
          device: device,
          cost: 0,
          conversions: 0,
          conversionsValue: 0,
          clicks: 0,
          impressions: 0
        };
      }
      
      devices[device].cost += parseInt(row.metrics.cost_micros) / 1000000;
      devices[device].conversions += parseFloat(row.metrics.conversions);
      devices[device].conversionsValue += parseInt(row.metrics.conversions_value) / 1000000;
      devices[device].clicks += parseInt(row.metrics.clicks);
      devices[device].impressions += parseInt(row.metrics.impressions);
    });

    return Object.values(devices).map(device => ({
      ...device,
      roas: device.cost > 0 ? device.conversionsValue / device.cost : 0,
      ctr: device.impressions > 0 ? (device.clicks / device.impressions) * 100 : 0,
      conversionRate: device.clicks > 0 ? (device.conversions / device.clicks) * 100 : 0
    }));
  }
}

module.exports = GoogleAdsService; 