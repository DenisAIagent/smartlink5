const { GoogleAdsApi } = require('google-ads-api');

class GoogleAdsAccountService {
  constructor() {
    this.client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    });
  }

  async getAccessibleAccounts() {
    try {
      const customerId = process.env.CUSTOMER_ID;
      if (!customerId) {
        throw new Error("Veuillez configurer la variable CUSTOMER_ID dans le fichier backend/.env.");
      }
      
      const mainCustomer = this.client.Customer({
        customer_id: customerId,
        refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
      });

      const isManager = await this.isManagerAccount(mainCustomer);

      if (isManager) {
        return await this.getAccountsFromManager(mainCustomer);
      } else {
        return await this.getSingleAccountDetails(mainCustomer);
      }

    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw new Error('Unable to fetch Google Ads accounts');
    }
  }

  async isManagerAccount(customer) {
    const query = `
      SELECT customer.manager
      FROM customer
      LIMIT 1
    `;
    const result = await customer.query(query);
    return result[0]?.customer.manager || false;
  }

  async getAccountsFromManager(managerCustomer) {
    const query = `
      SELECT 
        customer_client.id,
        customer_client.descriptive_name,
        customer_client.currency_code,
        customer_client.time_zone,
        customer_client.status,
        customer_client.manager
      FROM customer_client
      WHERE customer_client.status = 'ENABLED'
      ORDER BY customer_client.descriptive_name
    `;

    const results = await managerCustomer.query(query);
    
    return results.map(row => ({
      id: row.customer_client.id,
      name: row.customer_client.descriptive_name,
      currency: row.customer_client.currency_code,
      timezone: row.customer_client.time_zone,
      status: row.customer_client.status.toLowerCase(),
      isManager: row.customer_client.manager,
      formattedId: this.formatCustomerId(row.customer_client.id)
    }));
  }

  async getSingleAccountDetails(customer) {
    const query = `
      SELECT 
        customer.id,
        customer.descriptive_name,
        customer.currency_code,
        customer.time_zone,
        customer.status
      FROM customer
    `;

    const results = await customer.query(query);
    
    return results.map(row => ({
      id: row.customer.id,
      name: row.customer.descriptive_name || `Compte ${this.formatCustomerId(row.customer.id)}`,
      currency: row.customer.currency_code,
      timezone: row.customer.time_zone,
      status: row.customer.status.toLowerCase(),
      isManager: false,
      formattedId: this.formatCustomerId(row.customer.id)
    }));
  }

  async getAccountBasicMetrics(customerId, dateRange = 'LAST_7_DAYS') {
    const customer = this.client.Customer({
      customer_id: customerId,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    });

    const query = `
      SELECT 
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value,
        metrics.clicks,
        metrics.impressions
      FROM account_performance_view 
      WHERE segments.date DURING ${dateRange}
    `;

    const results = await customer.query(query);
    
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

    return {
      spend: totalCost,
      conversions: totalConversions,
      revenue: totalConversionsValue,
      clicks: totalClicks,
      impressions: totalImpressions,
      roas: totalCost > 0 ? totalConversionsValue / totalCost : 0
    };
  }

  formatCustomerId(customerId) {
    const str = customerId.toString();
    return `${str.slice(0, 3)}-${str.slice(3, 6)}-${str.slice(6)}`;
  }
}

module.exports = GoogleAdsAccountService; 