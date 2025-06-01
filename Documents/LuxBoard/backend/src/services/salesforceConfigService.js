const jsforce = require('jsforce');
const redis = require('../config/redis');
const config = require('../config');

class SalesforceConfigService {
  constructor() {
    this.cacheKey = 'salesforce:config';
    this.cacheTTL = 3600; // 1 heure
    this.connection = null;
  }

  async getConfig() {
    try {
      // Vérifier le cache
      const cachedConfig = await redis.get(this.cacheKey);
      if (cachedConfig) {
        return JSON.parse(cachedConfig);
      }

      // Récupérer la configuration depuis la base de données ou les variables d'environnement
      const config = {
        instanceUrl: process.env.SALESFORCE_INSTANCE_URL,
        clientId: process.env.SALESFORCE_CLIENT_ID,
        clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
        username: process.env.SALESFORCE_USERNAME,
        password: process.env.SALESFORCE_PASSWORD,
        securityToken: process.env.SALESFORCE_SECURITY_TOKEN,
        isActive: process.env.SALESFORCE_IS_ACTIVE === 'true',
        status: 'disconnected',
      };

      // Mettre en cache la configuration
      await redis.setex(this.cacheKey, this.cacheTTL, JSON.stringify(config));

      return config;
    } catch (error) {
      console.error('Erreur lors de la récupération de la configuration:', error);
      throw error;
    }
  }

  async updateConfig(configData) {
    try {
      // Mettre à jour les variables d'environnement
      process.env.SALESFORCE_INSTANCE_URL = configData.instanceUrl;
      process.env.SALESFORCE_CLIENT_ID = configData.clientId;
      process.env.SALESFORCE_CLIENT_SECRET = configData.clientSecret;
      process.env.SALESFORCE_USERNAME = configData.username;
      process.env.SALESFORCE_PASSWORD = configData.password;
      process.env.SALESFORCE_SECURITY_TOKEN = configData.securityToken;
      process.env.SALESFORCE_IS_ACTIVE = configData.isActive.toString();

      // Mettre à jour le cache
      const config = {
        ...configData,
        status: 'disconnected',
      };
      await redis.setex(this.cacheKey, this.cacheTTL, JSON.stringify(config));

      return config;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la configuration:', error);
      throw error;
    }
  }

  async testConnection() {
    try {
      const config = await this.getConfig();

      // Créer une nouvelle connexion
      this.connection = new jsforce.Connection({
        loginUrl: config.instanceUrl,
      });

      // Tenter de se connecter
      await this.connection.login(
        config.username,
        config.password + config.securityToken
      );

      // Mettre à jour le statut de la connexion
      const updatedConfig = {
        ...config,
        status: 'connected',
      };
      await redis.setex(this.cacheKey, this.cacheTTL, JSON.stringify(updatedConfig));

      return {
        success: true,
        message: 'Connexion établie avec succès',
      };
    } catch (error) {
      console.error('Erreur lors du test de connexion:', error);
      throw error;
    }
  }

  async getConnection() {
    try {
      if (!this.connection) {
        const config = await this.getConfig();
        this.connection = new jsforce.Connection({
          loginUrl: config.instanceUrl,
        });

        if (config.status === 'connected') {
          await this.connection.login(
            config.username,
            config.password + config.securityToken
          );
        }
      }

      return this.connection;
    } catch (error) {
      console.error('Erreur lors de la récupération de la connexion:', error);
      throw error;
    }
  }

  async invalidateCache() {
    try {
      await redis.del(this.cacheKey);
      this.connection = null;
    } catch (error) {
      console.error('Erreur lors de l\'invalidation du cache:', error);
      throw error;
    }
  }
}

module.exports = new SalesforceConfigService(); 