// src/services/google-ads-api.ts
import { GOOGLE_ADS_CONFIG, GoogleAdsAccount, GoogleAdsCampaign, GoogleAdsMetrics } from '@/config/google-ads';

class GoogleAdsApiService {
  private apiKey: string;
  private accessToken: string | null = null;

  constructor() {
    this.apiKey = GOOGLE_ADS_CONFIG.API_KEY;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.accessToken}`,
      'developer-token': this.apiKey,
    };
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.accessToken) {
      throw new Error('Token d\'accès requis. Veuillez vous authentifier avec Google.');
    }

    const url = `${GOOGLE_ADS_CONFIG.BASE_URL}/${GOOGLE_ADS_CONFIG.API_VERSION}/${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Erreur API Google Ads: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    return response.json();
  }

  // Récupérer les comptes Google Ads accessibles
  async getAccessibleAccounts(): Promise<GoogleAdsAccount[]> {
    try {
      const response = await this.makeRequest<{ results: GoogleAdsAccount[] }>(
        'customers:listAccessibleCustomers'
      );
      return response.results || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des comptes:', error);
      throw error;
    }
  }

  // Récupérer les détails d'un compte spécifique
  async getAccountDetails(customerId: string): Promise<GoogleAdsAccount> {
    try {
      const query = `
        SELECT 
          customer.id,
          customer.descriptive_name,
          customer.currency_code,
          customer.time_zone,
          customer.test_account,
          customer.manager
        FROM customer
        LIMIT 1
      `;

      const response = await this.makeRequest<{ results: any[] }>(
        `customers/${customerId}/googleAds:searchStream`,
        {
          method: 'POST',
          body: JSON.stringify({ query })
        }
      );

      const customer = response.results[0]?.customer;
      return {
        resourceName: customer.resourceName,
        id: customer.id,
        name: customer.descriptiveName,
        currencyCode: customer.currencyCode,
        timeZone: customer.timeZone,
        descriptiveName: customer.descriptiveName,
        canManageClients: customer.manager,
        testAccount: customer.testAccount
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du compte:', error);
      throw error;
    }
  }

  // Récupérer les campagnes d'un compte
  async getCampaigns(customerId: string): Promise<GoogleAdsCampaign[]> {
    try {
      const query = `
        SELECT 
          campaign.id,
          campaign.name,
          campaign.status,
          campaign.advertising_channel_type,
          campaign.bidding_strategy_type,
          campaign.campaign_budget,
          campaign.start_date,
          campaign.end_date
        FROM campaign
        WHERE campaign.status != 'REMOVED'
        ORDER BY campaign.name
      `;

      const response = await this.makeRequest<{ results: any[] }>(
        `customers/${customerId}/googleAds:searchStream`,
        {
          method: 'POST',
          body: JSON.stringify({ query })
        }
      );

      return response.results.map(result => ({
        resourceName: result.campaign.resourceName,
        id: result.campaign.id,
        name: result.campaign.name,
        status: result.campaign.status,
        advertisingChannelType: result.campaign.advertisingChannelType,
        biddingStrategyType: result.campaign.biddingStrategyType,
        budget: result.campaign.campaignBudget,
        startDate: result.campaign.startDate,
        endDate: result.campaign.endDate
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des campagnes:', error);
      throw error;
    }
  }

  // Récupérer les métriques de performance
  async getMetrics(customerId: string, dateRange: { startDate: string; endDate: string }): Promise<GoogleAdsMetrics> {
    try {
      const query = `
        SELECT 
          metrics.impressions,
          metrics.clicks,
          metrics.conversions,
          metrics.cost_micros,
          metrics.ctr,
          metrics.average_cpc,
          metrics.cost_per_conversion,
          metrics.conversions_from_interactions_rate
        FROM campaign
        WHERE segments.date BETWEEN '${dateRange.startDate}' AND '${dateRange.endDate}'
      `;

      const response = await this.makeRequest<{ results: any[] }>(
        `customers/${customerId}/googleAds:searchStream`,
        {
          method: 'POST',
          body: JSON.stringify({ query })
        }
      );

      // Agréger les métriques
      const aggregatedMetrics = response.results.reduce(
        (acc, result) => {
          const metrics = result.metrics;
          return {
            impressions: acc.impressions + (metrics.impressions || 0),
            clicks: acc.clicks + (metrics.clicks || 0),
            conversions: acc.conversions + (metrics.conversions || 0),
            cost: acc.cost + ((metrics.costMicros || 0) / 1000000), // Convertir de micros
            ctr: 0, // Calculé après
            averageCpc: 0, // Calculé après
            costPerConversion: 0, // Calculé après
            conversionRate: 0 // Calculé après
          };
        },
        { impressions: 0, clicks: 0, conversions: 0, cost: 0, ctr: 0, averageCpc: 0, costPerConversion: 0, conversionRate: 0 }
      );

      // Calculer les métriques dérivées
      aggregatedMetrics.ctr = aggregatedMetrics.impressions > 0 
        ? (aggregatedMetrics.clicks / aggregatedMetrics.impressions) * 100 
        : 0;
      
      aggregatedMetrics.averageCpc = aggregatedMetrics.clicks > 0 
        ? aggregatedMetrics.cost / aggregatedMetrics.clicks 
        : 0;
      
      aggregatedMetrics.costPerConversion = aggregatedMetrics.conversions > 0 
        ? aggregatedMetrics.cost / aggregatedMetrics.conversions 
        : 0;
      
      aggregatedMetrics.conversionRate = aggregatedMetrics.clicks > 0 
        ? (aggregatedMetrics.conversions / aggregatedMetrics.clicks) * 100 
        : 0;

      return aggregatedMetrics;
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques:', error);
      throw error;
    }
  }

  // Authentification OAuth2 Google
  initiateOAuthFlow(): void {
    const { client_id, redirect_uri } = GOOGLE_ADS_CONFIG.OAUTH_CONFIG;
    
    if (!client_id) {
      throw new Error('Client ID Google non configuré. Veuillez définir REACT_APP_GOOGLE_CLIENT_ID.');
    }

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', client_id);
    authUrl.searchParams.set('redirect_uri', redirect_uri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', GOOGLE_ADS_CONFIG.SCOPES.join(' '));
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');

    window.location.href = authUrl.toString();
  }

  // Traiter le code d'autorisation OAuth2
  async handleOAuthCallback(code: string): Promise<string> {
    const { client_id, client_secret, redirect_uri } = GOOGLE_ADS_CONFIG.OAUTH_CONFIG;
    
    if (!client_id || !client_secret) {
      throw new Error('Configuration OAuth2 incomplète.');
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id,
        client_secret,
        redirect_uri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Échec de l\'échange du code d\'autorisation');
    }

    const tokenData = await tokenResponse.json();
    this.setAccessToken(tokenData.access_token);
    
    // Stocker le token pour les sessions futures
    localStorage.setItem('google_ads_access_token', tokenData.access_token);
    if (tokenData.refresh_token) {
      localStorage.setItem('google_ads_refresh_token', tokenData.refresh_token);
    }

    return tokenData.access_token;
  }

  // Restaurer le token depuis le localStorage
  restoreAccessToken(): boolean {
    const token = localStorage.getItem('google_ads_access_token');
    if (token) {
      this.setAccessToken(token);
      return true;
    }
    return false;
  }

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }
}

export const googleAdsApi = new GoogleAdsApiService();
