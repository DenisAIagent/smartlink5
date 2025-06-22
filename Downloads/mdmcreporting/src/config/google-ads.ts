// src/config/google-ads.ts
export const GOOGLE_ADS_CONFIG = {
  API_KEY: 'CxDKMTI2CrPhkaNgHtwkoA',
  API_VERSION: 'v17',
  BASE_URL: 'https://googleads.googleapis.com',
  SCOPES: [
    'https://www.googleapis.com/auth/adwords',
    'https://www.googleapis.com/auth/adwords.readonly'
  ],
  // Configuration OAuth2 (à compléter avec vos identifiants)
  OAUTH_CONFIG: {
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
    redirect_uri: `${window.location.origin}/auth/callback`
  }
};

// Types pour l'API Google Ads
export interface GoogleAdsAccount {
  resourceName: string;
  id: string;
  name: string;
  currencyCode: string;
  timeZone: string;
  descriptiveName: string;
  canManageClients: boolean;
  testAccount: boolean;
}

export interface GoogleAdsCampaign {
  resourceName: string;
  id: string;
  name: string;
  status: 'ENABLED' | 'PAUSED' | 'REMOVED';
  advertisingChannelType: string;
  biddingStrategyType: string;
  budget: string;
  startDate: string;
  endDate?: string;
}

export interface GoogleAdsMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  ctr: number;
  averageCpc: number;
  costPerConversion: number;
  conversionRate: number;
}
