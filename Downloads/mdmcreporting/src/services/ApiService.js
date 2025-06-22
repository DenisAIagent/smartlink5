class ApiService {
  constructor() {
    this.baseURL = '/api';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }

    return response.json();
  }

  // Accounts
  async getAccounts() {
    return this.request('/accounts');
  }

  async refreshAccounts() {
    return this.request('/accounts/refresh', { method: 'POST' });
  }

  async getAccountDetails(customerId) {
    return this.request(`/accounts/${customerId}`);
  }

  // Dashboard data
  async getMetrics(customerId, dateRange = 'LAST_30_DAYS') {
    return this.request(`/metrics?customerId=${customerId}&dateRange=${dateRange}`);
  }

  async getCampaigns(customerId, dateRange = 'LAST_30_DAYS') {
    return this.request(`/campaigns?customerId=${customerId}&dateRange=${dateRange}`);
  }

  async getDeviceComparison(customerId, dateRange = 'LAST_30_DAYS') {
    return this.request(`/device-comparison?customerId=${customerId}&dateRange=${dateRange}`);
  }

  // Utility
  async checkHealth() {
    return this.request('/health');
  }

  async testConnection(customerId) {
    return this.request(`/test/${customerId}`);
  }
}

export default new ApiService(); 