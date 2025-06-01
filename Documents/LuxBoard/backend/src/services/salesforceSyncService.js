const salesforceConfigService = require('./salesforceConfigService');
const redis = require('../config/redis');
const logger = require('../utils/logger');

class SalesforceSyncService {
  constructor() {
    this.syncLockKey = 'salesforce:sync:lock';
    this.syncStatusKey = 'salesforce:sync:status';
    this.syncInterval = 5 * 60 * 1000; // 5 minutes
  }

  async startSync() {
    try {
      // Vérifier si une synchronisation est déjà en cours
      const isLocked = await redis.get(this.syncLockKey);
      if (isLocked) {
        throw new Error('Une synchronisation est déjà en cours');
      }

      // Acquérir le verrou
      await redis.setex(this.syncLockKey, 300, 'locked'); // 5 minutes de timeout

      // Mettre à jour le statut
      await this.updateSyncStatus('running');

      // Récupérer la connexion Salesforce
      const connection = await salesforceConfigService.getConnection();

      // Synchroniser les prestataires
      await this.syncVendors(connection);

      // Synchroniser les cas
      await this.syncCases(connection);

      // Mettre à jour le statut
      await this.updateSyncStatus('completed');

      // Libérer le verrou
      await redis.del(this.syncLockKey);

      return {
        success: true,
        message: 'Synchronisation terminée avec succès',
      };
    } catch (error) {
      logger.error('Erreur lors de la synchronisation:', error);
      await this.updateSyncStatus('failed', error.message);
      await redis.del(this.syncLockKey);
      throw error;
    }
  }

  async syncVendors(connection) {
    try {
      // Récupérer les prestataires de Salesforce
      const result = await connection.query(
        'SELECT Id, Name, Type, Status, Description FROM Account WHERE RecordType.Name = \'Vendor\''
      );

      // Traiter chaque prestataire
      for (const vendor of result.records) {
        await this.processVendor(vendor);
      }

      logger.info(`${result.records.length} prestataires synchronisés`);
    } catch (error) {
      logger.error('Erreur lors de la synchronisation des prestataires:', error);
      throw error;
    }
  }

  async syncCases(connection) {
    try {
      // Récupérer les cas de Salesforce
      const result = await connection.query(
        'SELECT Id, CaseNumber, Subject, Description, Status, Priority, AccountId, CreatedDate FROM Case'
      );

      // Traiter chaque cas
      for (const case_ of result.records) {
        await this.processCase(case_);
      }

      logger.info(`${result.records.length} cas synchronisés`);
    } catch (error) {
      logger.error('Erreur lors de la synchronisation des cas:', error);
      throw error;
    }
  }

  async processVendor(vendor) {
    try {
      // Vérifier si le prestataire existe déjà
      const existingVendor = await this.findVendorBySalesforceId(vendor.Id);

      if (existingVendor) {
        // Mettre à jour le prestataire existant
        await this.updateVendor(existingVendor.id, {
          name: vendor.Name,
          type: vendor.Type,
          status: vendor.Status,
          description: vendor.Description,
          salesforceId: vendor.Id,
        });
      } else {
        // Créer un nouveau prestataire
        await this.createVendor({
          name: vendor.Name,
          type: vendor.Type,
          status: vendor.Status,
          description: vendor.Description,
          salesforceId: vendor.Id,
        });
      }
    } catch (error) {
      logger.error('Erreur lors du traitement du prestataire:', error);
      throw error;
    }
  }

  async processCase(case_) {
    try {
      // Vérifier si le cas existe déjà
      const existingCase = await this.findCaseBySalesforceId(case_.Id);

      if (existingCase) {
        // Mettre à jour le cas existant
        await this.updateCase(existingCase.id, {
          reference: case_.CaseNumber,
          subject: case_.Subject,
          description: case_.Description,
          status: case_.Status,
          priority: case_.Priority,
          vendorId: await this.getVendorIdBySalesforceId(case_.AccountId),
          salesforceId: case_.Id,
        });
      } else {
        // Créer un nouveau cas
        await this.createCase({
          reference: case_.CaseNumber,
          subject: case_.Subject,
          description: case_.Description,
          status: case_.Status,
          priority: case_.Priority,
          vendorId: await this.getVendorIdBySalesforceId(case_.AccountId),
          salesforceId: case_.Id,
        });
      }
    } catch (error) {
      logger.error('Erreur lors du traitement du cas:', error);
      throw error;
    }
  }

  async updateSyncStatus(status, error = null) {
    try {
      const syncStatus = {
        status,
        lastSync: new Date().toISOString(),
        error,
      };

      await redis.setex(
        this.syncStatusKey,
        3600,
        JSON.stringify(syncStatus)
      );

      return syncStatus;
    } catch (error) {
      logger.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  }

  async getSyncStatus() {
    try {
      const status = await redis.get(this.syncStatusKey);
      return status ? JSON.parse(status) : null;
    } catch (error) {
      logger.error('Erreur lors de la récupération du statut:', error);
      throw error;
    }
  }

  // Méthodes utilitaires à implémenter selon votre modèle de données
  async findVendorBySalesforceId(salesforceId) {
    // Implémenter la recherche d'un prestataire par son ID Salesforce
  }

  async findCaseBySalesforceId(salesforceId) {
    // Implémenter la recherche d'un cas par son ID Salesforce
  }

  async getVendorIdBySalesforceId(salesforceId) {
    // Implémenter la récupération de l'ID LuxBoard d'un prestataire par son ID Salesforce
  }

  async createVendor(vendorData) {
    // Implémenter la création d'un prestataire
  }

  async updateVendor(vendorId, vendorData) {
    // Implémenter la mise à jour d'un prestataire
  }

  async createCase(caseData) {
    // Implémenter la création d'un cas
  }

  async updateCase(caseId, caseData) {
    // Implémenter la mise à jour d'un cas
  }
}

module.exports = new SalesforceSyncService(); 