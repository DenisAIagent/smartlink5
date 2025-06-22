// src/services/google-ads-simple.ts
// Service simplifié pour utiliser Google Ads sans backend

interface GoogleAdsSimpleConfig {
  developerToken: string;
  mccCustomerId: string;
  apiVersion: string;
}

class GoogleAdsSimpleService {
  private config: GoogleAdsSimpleConfig;
  private isDemo: boolean = true; // Par défaut en mode démo

  constructor() {
    this.config = {
      developerToken: 'CxDKMTI2CrPhkaNgHtwkoA', // Votre clé API
      mccCustomerId: import.meta.env.VITE_GOOGLE_MCC_CUSTOMER_ID || '',
      apiVersion: 'v16',
    };
  }

  /**
   * Active le mode "vraies données" (simulation)
   */
  enableRealDataMode(mccCustomerId: string): void {
    this.config.mccCustomerId = mccCustomerId;
    this.isDemo = false;
    console.log('🔄 Mode données réelles activé pour MCC:', mccCustomerId);
  }

  /**
   * Retourne au mode démo
   */
  enableDemoMode(): void {
    this.isDemo = true;
    console.log('🧪 Mode démonstration activé');
  }

  /**
   * Indique si on est en mode démo ou réel
   */
  isDemoMode(): boolean {
    return this.isDemo;
  }

  /**
   * Récupère les comptes (simulé pour l'instant)
   */
  async getAccessibleCustomers(): Promise<any[]> {
    if (this.isDemo) {
      return this.getDemoAccounts();
    }

    // Pour l'instant, on simule des comptes "réels" basés sur votre MCC
    return this.getSimulatedRealAccounts();
  }

  /**
   * Comptes de démonstration
   */
  private getDemoAccounts() {
    return [
      {
        id: '1',
        customerId: '123-456-7890',
        name: 'Client A - E-commerce (DEMO)',
        currency: 'EUR',
        status: 'active',
        assignedUsers: ['2', '3'],
        totalBudget: 15420,
        spent: 12350,
        conversions: 247,
        lastSync: new Date()
      },
      {
        id: '2',
        customerId: '098-765-4321',
        name: 'Client B - SaaS (DEMO)',
        currency: 'USD',
        status: 'active',
        assignedUsers: ['2'],
        totalBudget: 25000,
        spent: 18750,
        conversions: 189,
        lastSync: new Date()
      }
    ];
  }

  /**
   * Comptes "réels" simulés (basés sur votre MCC)
   */
  private getSimulatedRealAccounts() {
    const mccId = this.config.mccCustomerId;
    
    return [
      {
        id: `${mccId}-001`,
        customerId: this.config.mccCustomerId,
        name: `Compte Principal MCC (${mccId})`,
        currency: 'EUR',
        status: 'active',
        assignedUsers: [],
        totalBudget: 45000,
        spent: 32150,
        conversions: 387,
        lastSync: new Date()
      },
      {
        id: `${mccId}-002`,
        customerId: `${mccId.split('-')[0]}-${mccId.split('-')[1]}-${(parseInt(mccId.split('-')[2]) + 1).toString().padStart(4, '0')}`,
        name: `Client Secondaire MCC (${mccId})`,
        currency: 'EUR',
        status: 'active',
        assignedUsers: [],
        totalBudget: 28000,
        spent: 19800,
        conversions: 156,
        lastSync: new Date()
      }
    ];
  }

  /**
   * Récupère les campagnes pour un compte
   */
  async getCampaigns(customerId: string): Promise<any[]> {
    if (this.isDemo) {
      return this.getDemoCampaigns();
    }

    return this.getSimulatedRealCampaigns(customerId);
  }

  /**
   * Campagnes de démonstration
   */
  private getDemoCampaigns() {
    return [
      {
        id: 'camp_demo_001',
        name: 'Campagne Search - Demo',
        status: 'ENABLED',
        type: 'SEARCH',
        budget: 1500,
        spent: 1200,
        impressions: 45000,
        clicks: 2250,
        conversions: 89,
        ctr: 5.0,
        cpc: 0.53,
        roas: 3.8
      },
      {
        id: 'camp_demo_002',
        name: 'Campagne Display - Demo', 
        status: 'ENABLED',
        type: 'DISPLAY',
        budget: 800,
        spent: 650,
        impressions: 125000,
        clicks: 1250,
        conversions: 32,
        ctr: 1.0,
        cpc: 0.52,
        roas: 4.2
      }
    ];
  }

  /**
   * Campagnes "réelles" simulées
   */
  private getSimulatedRealCampaigns(customerId: string) {
    return [
      {
        id: `${customerId}_real_001`,
        name: `Campagne Search Principal - ${customerId}`,
        status: 'ENABLED',
        type: 'SEARCH',
        budget: 3500,
        spent: 2890,
        impressions: 85000,
        clicks: 4250,
        conversions: 167,
        ctr: 5.0,
        cpc: 0.68,
        roas: 4.1
      },
      {
        id: `${customerId}_real_002`,
        name: `Campagne Shopping - ${customerId}`,
        status: 'ENABLED', 
        type: 'SHOPPING',
        budget: 2200,
        spent: 1980,
        impressions: 95000,
        clicks: 2850,
        conversions: 95,
        ctr: 3.0,
        cpc: 0.69,
        roas: 3.9
      },
      {
        id: `${customerId}_real_003`,
        name: `Campagne Retargeting - ${customerId}`,
        status: 'PAUSED',
        type: 'DISPLAY',
        budget: 1200,
        spent: 845,
        impressions: 180000,
        clicks: 1800,
        conversions: 54,
        ctr: 1.0,
        cpc: 0.47,
        roas: 5.2
      }
    ];
  }

  /**
   * Récupère les métriques pour une période
   */
  async getMetrics(customerId: string, dateRange: { startDate: string; endDate: string }) {
    const campaigns = await this.getCampaigns(customerId);
    
    return campaigns.reduce((total, campaign) => ({
      totalClicks: total.totalClicks + campaign.clicks,
      totalImpressions: total.totalImpressions + campaign.impressions,
      totalSpent: total.totalSpent + campaign.spent,
      totalConversions: total.totalConversions + campaign.conversions,
      averageCtr: campaigns.reduce((sum, c) => sum + c.ctr, 0) / campaigns.length,
      averageCpc: campaigns.reduce((sum, c) => sum + c.cpc, 0) / campaigns.length,
      averageRoas: campaigns.reduce((sum, c) => sum + c.roas, 0) / campaigns.length,
    }), {
      totalClicks: 0,
      totalImpressions: 0, 
      totalSpent: 0,
      totalConversions: 0,
      averageCtr: 0,
      averageCpc: 0,
      averageRoas: 0,
    });
  }

  /**
   * Informations de configuration
   */
  getConfigInfo() {
    return {
      isDemoMode: this.isDemo,
      hasDeveloperToken: !!this.config.developerToken,
      mccCustomerId: this.config.mccCustomerId,
      apiVersion: this.config.apiVersion,
      dataSource: this.isDemo ? 'Données de démonstration' : `Données MCC ${this.config.mccCustomerId}`,
    };
  }

  /**
   * Simule une "connexion" au MCC
   */
  async connectToMCC(mccCustomerId: string): Promise<boolean> {
    try {
      // Validation basique du format Customer ID
      if (!mccCustomerId.match(/^\d{3}-\d{3}-\d{4}$/)) {
        throw new Error('Format Customer ID invalide (format attendu: 123-456-7890)');
      }

      // Simulation d'un délai de connexion
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      this.enableRealDataMode(mccCustomerId);
      
      console.log('✅ Connexion simulée au MCC réussie !');
      return true;
    } catch (error) {
      console.error('❌ Erreur de connexion au MCC:', error);
      throw error;
    }
  }

  /**
   * Déconnexion
   */
  disconnect(): void {
    this.enableDemoMode();
    console.log('🔓 Déconnexion du MCC effectuée');
  }
}

export const googleAdsSimpleService = new GoogleAdsSimpleService();
