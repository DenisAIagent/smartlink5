import { Connection } from 'jsforce';
import { logger } from '../utils/logger';

const salesforceConfig = {
  loginUrl: process.env.SALESFORCE_URL || 'https://login.salesforce.com',
  username: process.env.SALESFORCE_USERNAME,
  password: process.env.SALESFORCE_PASSWORD,
  securityToken: process.env.SALESFORCE_SECURITY_TOKEN
};

export const salesforceClient = new Connection({
  loginUrl: salesforceConfig.loginUrl
});

salesforceClient.on('refresh', (accessToken) => {
  logger.info('Token Salesforce rafraîchi');
});

salesforceClient.on('error', (error) => {
  logger.error('Erreur de connexion Salesforce:', error);
}); 