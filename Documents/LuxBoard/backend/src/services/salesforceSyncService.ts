import { redisClient } from '../config/redis';
import { salesforceClient } from '../config/salesforce';
import { logger } from '../utils/logger';

interface SyncStatus {
  status: 'idle' | 'in_progress' | 'completed' | 'error';
  lastSync: string | null;
}

interface SyncData {
  status: string;
  timestamp: string;
}

export class SalesforceSyncService {
  private static instance: SalesforceSyncService;

  private constructor() {}

  public static getInstance(): SalesforceSyncService {
    if (!SalesforceSyncService.instance) {
      SalesforceSyncService.instance = new SalesforceSyncService();
    }
    return SalesforceSyncService.instance;
  }

  public async startSync(): Promise<boolean> {
    try {
      const currentStatus = await this.getSyncStatus();
      if (currentStatus.status === 'in_progress') {
        return false;
      }

      await redisClient.set('salesforce:sync:status', 'in_progress');
      await salesforceClient.login();
      return true;
    } catch (error) {
      logger.error('Erreur lors du démarrage de la synchronisation:', error);
      await this.updateSyncStatus('error');
      return false;
    }
  }

  public async getSyncStatus(): Promise<SyncStatus> {
    try {
      const status = await redisClient.get('salesforce:sync:status');
      const lastSync = await redisClient.get('salesforce:sync:lastSync');
      return {
        status: (status as SyncStatus['status']) || 'idle',
        lastSync: lastSync || null
      };
    } catch (error) {
      logger.error('Erreur lors de la récupération du statut:', error);
      return { status: 'error', lastSync: null };
    }
  }

  public async syncVendors(): Promise<any[]> {
    try {
      const query = 'SELECT Id, Name, Type FROM Account WHERE Type IN (\'Premium\', \'Standard\')';
      const result = await salesforceClient.query(query);
      const vendors = result.records.map((record: any) => ({
        id: record.Id,
        name: record.Name,
        type: record.Type
      }));

      await redisClient.set('salesforce:vendors', JSON.stringify(vendors));
      return vendors;
    } catch (error) {
      logger.error('Erreur lors de la synchronisation des prestataires:', error);
      throw new Error('Erreur lors de la synchronisation des prestataires');
    }
  }

  public async syncCases(): Promise<any[]> {
    try {
      const query = 'SELECT Id, Subject, Status FROM Case WHERE Status IN (\'New\', \'In Progress\')';
      const result = await salesforceClient.query(query);
      const cases = result.records.map((record: any) => ({
        id: record.Id,
        subject: record.Subject,
        status: record.Status
      }));

      await redisClient.set('salesforce:cases', JSON.stringify(cases));
      return cases;
    } catch (error) {
      logger.error('Erreur lors de la synchronisation des cas:', error);
      throw new Error('Erreur lors de la synchronisation des cas');
    }
  }

  public async cacheSyncData(data: SyncData): Promise<void> {
    try {
      await redisClient.set('salesforce:sync:data', JSON.stringify(data));
    } catch (error) {
      logger.error('Erreur lors de la mise en cache des données:', error);
      throw new Error('Erreur lors de la mise en cache des données');
    }
  }

  public async getCachedSyncData(): Promise<SyncData | null> {
    try {
      const data = await redisClient.get('salesforce:sync:data');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Erreur lors de la récupération des données en cache:', error);
      return null;
    }
  }

  public async invalidateCache(): Promise<void> {
    try {
      await redisClient.del('salesforce:sync:data');
    } catch (error) {
      logger.error('Erreur lors de l\'invalidation du cache:', error);
      throw new Error('Erreur lors de l\'invalidation du cache');
    }
  }

  private async updateSyncStatus(status: SyncStatus['status']): Promise<void> {
    try {
      await redisClient.set('salesforce:sync:status', status);
      if (status === 'completed') {
        await redisClient.set('salesforce:sync:lastSync', new Date().toISOString());
      }
    } catch (error) {
      logger.error('Erreur lors de la mise à jour du statut:', error);
    }
  }
}

export const salesforceSyncService = SalesforceSyncService.getInstance(); 