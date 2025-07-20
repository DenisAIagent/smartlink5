import crypto from 'crypto';
import pool from '../db/pool.js';
import { logger } from '../utils/logger.js';

export class WebhookManager {
  constructor() {
    this.webhookCache = new Map(); // Cache des webhooks actifs
    this.loadActiveWebhooks();
  }

  /**
   * Crée un nouveau webhook pour un workflow
   */
  async createWebhook(workflowId, config = {}) {
    try {
      const webhookPath = this.generateWebhookPath();
      const secretToken = config.useSecret ? crypto.randomBytes(32).toString('hex') : null;
      const httpMethod = config.method || 'POST';

      const result = await pool.query(
        `INSERT INTO webhook_endpoints (workflow_id, webhook_path, http_method, secret_token)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [workflowId, webhookPath, httpMethod, secretToken]
      );

      const webhook = result.rows[0];

      // Ajouter au cache
      this.webhookCache.set(webhookPath, {
        ...webhook,
        config
      });

      logger.info({ webhook_id: webhook.id, workflow_id: workflowId, path: webhookPath }, 'Webhook créé');

      return {
        id: webhook.id,
        url: `${this.getBaseUrl()}/webhook/${webhookPath}`,
        path: webhookPath,
        method: httpMethod,
        secretToken: secretToken,
        isActive: webhook.is_active
      };

    } catch (error) {
      logger.error({ error, workflow_id: workflowId }, 'Erreur création webhook');
      throw error;
    }
  }

  /**
   * Traite une requête webhook entrante
   */
  async handleWebhookRequest(path, request, reply) {
    try {
      const webhook = this.webhookCache.get(path);
      
      if (!webhook) {
        logger.warn({ path }, 'Webhook non trouvé');
        return reply.code(404).send({ error: 'Webhook non trouvé' });
      }

      if (!webhook.is_active) {
        logger.warn({ path, webhook_id: webhook.id }, 'Webhook inactif');
        return reply.code(410).send({ error: 'Webhook inactif' });
      }

      // Vérifier la méthode HTTP
      if (request.method !== webhook.http_method) {
        return reply.code(405).send({ error: `Méthode ${request.method} non autorisée` });
      }

      // Vérifier le token secret si configuré
      if (webhook.secret_token) {
        const receivedToken = request.headers['x-webhook-secret'] || request.headers['authorization']?.replace('Bearer ', '');
        if (receivedToken !== webhook.secret_token) {
          logger.warn({ webhook_id: webhook.id }, 'Token secret invalide');
          return reply.code(401).send({ error: 'Token secret invalide' });
        }
      }

      // Préparer les données du trigger
      const triggerData = {
        method: request.method,
        headers: request.headers,
        query: request.query,
        body: request.body,
        params: request.params,
        webhook: {
          id: webhook.id,
          path: webhook.webhook_path,
          triggeredAt: new Date().toISOString()
        }
      };

      logger.info({ webhook_id: webhook.id, workflow_id: webhook.workflow_id }, 'Webhook déclenché');

      // Mettre à jour les statistiques
      await this.updateWebhookStats(webhook.id);

      // Déclencher le workflow (sera fait par le moteur d'exécution)
      const workflowEngine = await import('../engine/workflow-engine.js');
      const result = await workflowEngine.workflowEngine.executeWorkflow(
        webhook.workflow_id,
        triggerData
      );

      // Répondre avec succès
      return reply.code(200).send({
        status: 'success',
        message: 'Webhook traité avec succès',
        workflowId: webhook.workflow_id,
        executionId: result.executionId || 'unknown'
      });

    } catch (error) {
      logger.error({ error, path }, 'Erreur traitement webhook');
      return reply.code(500).send({ 
        error: 'Erreur interne lors du traitement du webhook',
        message: error.message 
      });
    }
  }

  /**
   * Charge tous les webhooks actifs en mémoire
   */
  async loadActiveWebhooks() {
    try {
      const result = await pool.query(
        'SELECT * FROM webhook_endpoints WHERE is_active = true'
      );

      this.webhookCache.clear();
      result.rows.forEach(webhook => {
        this.webhookCache.set(webhook.webhook_path, webhook);
      });

      logger.info({ count: result.rows.length }, 'Webhooks actifs chargés');

    } catch (error) {
      logger.error({ error }, 'Erreur chargement webhooks');
    }
  }

  /**
   * Met à jour les statistiques d'un webhook
   */
  async updateWebhookStats(webhookId) {
    try {
      await pool.query(
        `UPDATE webhook_endpoints 
         SET last_triggered_at = NOW(), total_triggers = total_triggers + 1
         WHERE id = $1`,
        [webhookId]
      );
    } catch (error) {
      logger.warn({ error, webhook_id: webhookId }, 'Erreur mise à jour stats webhook');
    }
  }

  /**
   * Active ou désactive un webhook
   */
  async toggleWebhook(webhookId, isActive) {
    try {
      const result = await pool.query(
        'UPDATE webhook_endpoints SET is_active = $1 WHERE id = $2 RETURNING *',
        [isActive, webhookId]
      );

      if (result.rows.length > 0) {
        const webhook = result.rows[0];
        
        if (isActive) {
          this.webhookCache.set(webhook.webhook_path, webhook);
        } else {
          this.webhookCache.delete(webhook.webhook_path);
        }

        logger.info({ webhook_id: webhookId, is_active: isActive }, 'Webhook basculé');
        return webhook;
      }

      return null;
    } catch (error) {
      logger.error({ error, webhook_id: webhookId }, 'Erreur bascule webhook');
      throw error;
    }
  }

  /**
   * Supprime un webhook
   */
  async deleteWebhook(webhookId) {
    try {
      const result = await pool.query(
        'DELETE FROM webhook_endpoints WHERE id = $1 RETURNING webhook_path',
        [webhookId]
      );

      if (result.rows.length > 0) {
        const path = result.rows[0].webhook_path;
        this.webhookCache.delete(path);
        logger.info({ webhook_id: webhookId, path }, 'Webhook supprimé');
      }

      return result.rowCount > 0;
    } catch (error) {
      logger.error({ error, webhook_id: webhookId }, 'Erreur suppression webhook');
      throw error;
    }
  }

  /**
   * Récupère les webhooks d'un workflow
   */
  async getWorkflowWebhooks(workflowId) {
    try {
      const result = await pool.query(
        'SELECT * FROM webhook_endpoints WHERE workflow_id = $1 ORDER BY created_at DESC',
        [workflowId]
      );

      return result.rows.map(webhook => ({
        ...webhook,
        url: `${this.getBaseUrl()}/webhook/${webhook.webhook_path}`
      }));

    } catch (error) {
      logger.error({ error, workflow_id: workflowId }, 'Erreur récupération webhooks workflow');
      throw error;
    }
  }

  /**
   * Récupère les statistiques d'un webhook
   */
  async getWebhookStats(webhookId, days = 30) {
    try {
      // Stats de base
      const webhookResult = await pool.query(
        'SELECT * FROM webhook_endpoints WHERE id = $1',
        [webhookId]
      );

      if (webhookResult.rows.length === 0) {
        return null;
      }

      const webhook = webhookResult.rows[0];

      // Stats d'exécution récentes
      const statsResult = await pool.query(
        `SELECT 
           COUNT(*) as total_executions,
           COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_executions,
           COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_executions,
           AVG(EXTRACT(EPOCH FROM (finished_at - started_at)) * 1000) as avg_duration_ms
         FROM executions e
         JOIN workflows w ON e.workflow_id = w.id
         JOIN webhook_endpoints we ON we.workflow_id = w.id
         WHERE we.id = $1 AND e.started_at > NOW() - INTERVAL '${days} days'`,
        [webhookId]
      );

      const stats = statsResult.rows[0];

      return {
        webhook: {
          ...webhook,
          url: `${this.getBaseUrl()}/webhook/${webhook.webhook_path}`
        },
        stats: {
          totalTriggers: parseInt(webhook.total_triggers),
          lastTriggeredAt: webhook.last_triggered_at,
          totalExecutions: parseInt(stats.total_executions),
          successfulExecutions: parseInt(stats.successful_executions),
          failedExecutions: parseInt(stats.failed_executions),
          averageDurationMs: parseFloat(stats.avg_duration_ms) || 0,
          successRate: stats.total_executions > 0 
            ? (stats.successful_executions / stats.total_executions * 100).toFixed(2)
            : 0,
          period: `${days} derniers jours`
        }
      };

    } catch (error) {
      logger.error({ error, webhook_id: webhookId }, 'Erreur récupération stats webhook');
      throw error;
    }
  }

  /**
   * Génère un chemin unique pour un webhook
   */
  generateWebhookPath() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Récupère l'URL de base pour les webhooks
   */
  getBaseUrl() {
    // En production, ceci devrait venir de la config
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.WEBHOOK_HOST || process.env.HOST || 'localhost';
    const port = process.env.WEBHOOK_PORT || process.env.PORT || 3000;
    
    if ((protocol === 'https' && port === '443') || (protocol === 'http' && port === '80')) {
      return `${protocol}://${host}`;
    }
    
    return `${protocol}://${host}:${port}`;
  }

  /**
   * Valide la configuration d'un webhook
   */
  validateWebhookConfig(config = {}) {
    const errors = [];

    if (config.method && !['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method)) {
      errors.push('Méthode HTTP invalide');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Teste un webhook en envoyant une requête de test
   */
  async testWebhook(webhookId) {
    try {
      const webhook = await pool.query(
        'SELECT * FROM webhook_endpoints WHERE id = $1',
        [webhookId]
      );

      if (webhook.rows.length === 0) {
        throw new Error('Webhook non trouvé');
      }

      const webhookData = webhook.rows[0];
      const testPayload = {
        test: true,
        message: 'Test webhook FlowForge',
        timestamp: new Date().toISOString(),
        webhookId: webhookId
      };

      // Simuler une requête webhook
      const mockRequest = {
        method: webhookData.http_method,
        headers: {
          'content-type': 'application/json',
          'user-agent': 'FlowForge-Webhook-Test/1.0'
        },
        query: {},
        body: testPayload,
        params: {}
      };

      const mockReply = {
        code: (statusCode) => ({
          send: (data) => ({ statusCode, data })
        })
      };

      const result = await this.handleWebhookRequest(
        webhookData.webhook_path,
        mockRequest,
        mockReply
      );

      return {
        success: true,
        result,
        webhook: {
          ...webhookData,
          url: `${this.getBaseUrl()}/webhook/${webhookData.webhook_path}`
        }
      };

    } catch (error) {
      logger.error({ error, webhook_id: webhookId }, 'Erreur test webhook');
      return {
        success: false,
        error: error.message
      };
    }
  }
}