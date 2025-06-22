// src/services/api.ts
import { User, GoogleAdsAccount, Alert } from '@/types';
import { googleAdsApi } from './google-ads-api';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.mdmc-reporting.com' 
  : 'http://localhost:8000';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GoogleAdsMetrics {
  clicks: number;
  impressions: number;
  cost_micros: number;
  conversions: number;
  conversion_rate: number;
  ctr: number;
  average_cpc: number;
  roas: number;
}

export interface CampaignData {
  id: string;
  name: string;
  status: string;
  budget_amount: number;
  metrics: GoogleAdsMetrics;
  last_updated: string;
}

class ApiService {
  private baseURL = API_BASE_URL;
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication endpoints
  async login(email: string, password: string) {
    return this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request<User>('/auth/me');
  }

  // Google Ads endpoints
  async getAccessibleAccounts() {
    return this.request<GoogleAdsAccount[]>('/google-ads/accounts');
  }

  async getCampaigns(customerId: string) {
    try {
      // Tenter d'utiliser l'API réelle si authentifié
      if (googleAdsApi.isAuthenticated()) {
        const realCampaigns = await googleAdsApi.getCampaigns(customerId);
        const formattedCampaigns: CampaignData[] = realCampaigns.map(campaign => ({
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          budget_amount: 1000, // À récupérer depuis l'API budget
          metrics: {
            clicks: 0,
            impressions: 0,
            cost_micros: 0,
            conversions: 0,
            conversion_rate: 0,
            ctr: 0,
            average_cpc: 0,
            roas: 0,
          },
          last_updated: new Date().toISOString(),
        }));
        return { success: true, data: formattedCampaigns };
      }

      // Fallback vers les données de démonstration
      const mockCampaigns: CampaignData[] = [
        {
          id: 'camp_001',
          name: 'Campagne Principale',
          status: 'ENABLED',
          budget_amount: 5000,
          metrics: {
            clicks: 1250,
            impressions: 25000,
            cost_micros: 3750000000,
            conversions: 45,
            conversion_rate: 3.6,
            ctr: 5.0,
            average_cpc: 3.0,
            roas: 4.2,
          },
          last_updated: new Date().toISOString(),
        },
        {
          id: 'camp_002',
          name: 'Campagne Saisonnière',
          status: 'PAUSED',
          budget_amount: 2000,
          metrics: {
            clicks: 480,
            impressions: 12000,
            cost_micros: 1440000000,
            conversions: 18,
            conversion_rate: 3.75,
            ctr: 4.0,
            average_cpc: 3.0,
            roas: 3.8,
          },
          last_updated: new Date().toISOString(),
        },
      ];

      return { success: true, data: mockCampaigns };
    } catch (error) {
      console.error('Erreur récupération campagnes:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  }

  async getCampaignMetrics(customerId: string, campaignId: string, dateRange?: string) {
    const params = new URLSearchParams({
      customer_id: customerId,
      campaign_id: campaignId,
    });
    
    if (dateRange) {
      params.append('date_range', dateRange);
    }

    return this.request<GoogleAdsMetrics>(`/google-ads/metrics?${params}`);
  }

  async getAccountSummary(customerId: string) {
    return this.request<{
      total_campaigns: number;
      active_campaigns: number;
      total_budget: number;
      total_spend: number;
      total_conversions: number;
      average_roas: number;
    }>(`/google-ads/summary?customer_id=${customerId}`);
  }

  // Admin endpoints
  async getUsers() {
    return this.request<User[]>('/admin/users');
  }

  async createUser(userData: Partial<User>) {
    return this.request<User>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: string, userData: Partial<User>) {
    return this.request<User>(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string) {
    return this.request<{ success: boolean }>(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async getGoogleAdsAccounts() {
    try {
      // Tenter d'utiliser l'API réelle si authentifié
      if (googleAdsApi.isAuthenticated()) {
        const realAccounts = await googleAdsApi.getAccessibleAccounts();
        const formattedAccounts: GoogleAdsAccount[] = realAccounts.map(account => ({
          id: account.id,
          name: account.name,
          currencyCode: account.currencyCode,
          timeZone: account.timeZone,
          customerId: account.id,
          descriptiveName: account.descriptiveName,
          canManageClients: account.canManageClients,
          testAccount: account.testAccount,
          autoTaggingEnabled: true,
          conversionTrackingId: parseInt(account.id),
        }));
        return { success: true, data: formattedAccounts };
      }

      // Fallback vers les données de démonstration
      const mockAccounts: GoogleAdsAccount[] = [
        {
          id: '123-456-7890',
          name: 'Compte Principal MDMC',
          currencyCode: 'EUR',
          timeZone: 'Europe/Paris',
          customerId: '1234567890',
          descriptiveName: 'MDMC - Campagnes Principales',
          canManageClients: false,
          testAccount: false,
          autoTaggingEnabled: true,
          conversionTrackingId: 987654321,
        },
        {
          id: '098-765-4321',
          name: 'Compte Test MDMC',
          currencyCode: 'EUR',
          timeZone: 'Europe/Paris',
          customerId: '0987654321',
          descriptiveName: 'MDMC - Tests & Expérimentations',
          canManageClients: false,
          testAccount: true,
          autoTaggingEnabled: true,
          conversionTrackingId: 123456789,
        },
      ];

      return { success: true, data: mockAccounts };
    } catch (error) {
      console.error('Erreur API Google Ads:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  }

  async assignAccountToUser(userId: string, customerId: string, permissions: string[]) {
    return this.request<{ success: boolean }>('/admin/assign-account', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        customer_id: customerId,
        permissions,
      }),
    });
  }

  // AI Chat endpoints
  async sendChatMessage(message: string, context: Record<string, unknown>) {
    return this.request<{ response: string; data?: Record<string, unknown> }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        context,
      }),
    });
  }

  // Alerts endpoints
  async getAlerts(customerId?: string) {
    const params = customerId ? `?customer_id=${customerId}` : '';
    return this.request<Alert[]>(`/alerts${params}`);
  }

  async createAlert(alertData: Partial<Alert>) {
    return this.request<Alert>('/alerts', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  }

  async updateAlert(alertId: string, alertData: Partial<Alert>) {
    return this.request<Alert>(`/alerts/${alertId}`, {
      method: 'PUT',
      body: JSON.stringify(alertData),
    });
  }

  async deleteAlert(alertId: string) {
    return this.request<{ success: boolean }>(`/alerts/${alertId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();