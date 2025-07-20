import cron from 'node-cron';
import pool from '../db/pool.js';
import { logger } from '../utils/logger.js';
import { WebhookManager } from './webhook-manager.js';

export class TriggerManager {
  constructor() {
    this.webhookManager = new WebhookManager();
    this.scheduledTasks = new Map();
    this.isRunning = false;
  }

  /**
   * Démarre tous les triggers actifs
   */
  async startAll(workflowEngine) {
    if (this.isRunning) {
      logger.warn('TriggerManager déjà démarré');
      return;
    }

    this.workflowEngine = workflowEngine;
    this.isRunning = true;

    try {
      await this.startScheduledTriggers();
      await this.webhookManager.loadActiveWebhooks();
      
      logger.info('Tous les triggers ont été démarrés');
    } catch (error) {
      logger.error({ error }, 'Erreur démarrage triggers');
      throw error;
    }
  }

  /**
   * Arrête tous les triggers
   */
  async stopAll() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    // Arrêter les tâches cron
    this.scheduledTasks.forEach((task, workflowId) => {
      task.destroy();
      logger.debug({ workflow_id: workflowId }, 'Tâche cron arrêtée');
    });
    this.scheduledTasks.clear();

    logger.info('Tous les triggers ont été arrêtés');
  }

  /**
   * Démarre les triggers programmés (cron)
   */
  async startScheduledTriggers() {
    try {
      // Récupérer tous les workflows avec des triggers schedule
      const result = await pool.query(`
        SELECT DISTINCT w.* 
        FROM workflows w
        JOIN workflow_nodes wn ON w.id = wn.workflow_id
        WHERE w.is_active = true 
        AND wn.node_type = 'trigger' 
        AND wn.component_key = 'schedule-trigger'
      `);

      for (const workflow of result.rows) {
        await this.startScheduleTrigger(workflow);
      }

      logger.info({ count: result.rows.length }, 'Triggers programmés démarrés');

    } catch (error) {
      logger.error({ error }, 'Erreur démarrage triggers programmés');
      throw error;
    }
  }

  /**
   * Démarre un trigger programmé spécifique
   */
  async startScheduleTrigger(workflow) {
    try {
      // Récupérer la config du trigger
      const triggerResult = await pool.query(`
        SELECT config FROM workflow_nodes 
        WHERE workflow_id = $1 AND node_type = 'trigger' AND component_key = 'schedule-trigger'
        LIMIT 1
      `, [workflow.id]);

      if (triggerResult.rows.length === 0) {
        logger.warn({ workflow_id: workflow.id }, 'Config trigger schedule non trouvée');
        return;
      }

      const triggerConfig = triggerResult.rows[0].config;
      const cronExpression = triggerConfig.cron || triggerConfig.schedule;

      if (!cronExpression) {
        logger.warn({ workflow_id: workflow.id }, 'Expression cron manquante');
        return;
      }

      // Valider l'expression cron
      if (!cron.validate(cronExpression)) {
        logger.error({ workflow_id: workflow.id, cron: cronExpression }, 'Expression cron invalide');
        return;
      }

      // Créer la tâche cron
      const task = cron.schedule(cronExpression, async () => {
        try {
          logger.debug({ workflow_id: workflow.id }, 'Exécution trigger programmé');
          
          const triggerData = {
            trigger: 'schedule',
            schedule: cronExpression,
            triggeredAt: new Date().toISOString(),
            workflow: {
              id: workflow.id,
              name: workflow.name
            }
          };

          await this.workflowEngine.executeWorkflow(workflow.id, triggerData, workflow.user_id);

        } catch (error) {
          logger.error({ error, workflow_id: workflow.id }, 'Erreur exécution trigger programmé');
        }
      }, {
        scheduled: false // On démarre manuellement après
      });

      // Sauvegarder la tâche
      this.scheduledTasks.set(workflow.id, task);
      
      // Démarrer la tâche
      task.start();

      logger.info({ 
        workflow_id: workflow.id, 
        cron: cronExpression,
        workflow_name: workflow.name 
      }, 'Trigger programmé démarré');

    } catch (error) {
      logger.error({ error, workflow_id: workflow.id }, 'Erreur démarrage trigger programmé');
    }
  }

  /**
   * Redémarre un trigger pour un workflow spécifique
   */
  async restartWorkflowTrigger(workflowId) {
    try {
      // Arrêter l'ancien trigger s'il existe
      const existingTask = this.scheduledTasks.get(workflowId);
      if (existingTask) {
        existingTask.destroy();
        this.scheduledTasks.delete(workflowId);
      }

      // Récupérer le workflow
      const workflowResult = await pool.query(
        'SELECT * FROM workflows WHERE id = $1 AND is_active = true',
        [workflowId]
      );

      if (workflowResult.rows.length === 0) {
        logger.warn({ workflow_id: workflowId }, 'Workflow non trouvé ou inactif');
        return;
      }

      const workflow = workflowResult.rows[0];

      // Déterminer le type de trigger
      const triggerResult = await pool.query(`
        SELECT node_type, component_key, config FROM workflow_nodes 
        WHERE workflow_id = $1 AND node_type = 'trigger'
        LIMIT 1
      `, [workflowId]);

      if (triggerResult.rows.length === 0) {
        logger.warn({ workflow_id: workflowId }, 'Aucun trigger trouvé');
        return;
      }

      const trigger = triggerResult.rows[0];

      // Redémarrer selon le type
      switch (trigger.component_key) {
        case 'schedule-trigger':
          await this.startScheduleTrigger(workflow);
          break;
          
        case 'webhook-trigger':
          // Les webhooks se rechargent automatiquement
          await this.webhookManager.loadActiveWebhooks();
          break;
          
        default:
          logger.warn({ workflow_id: workflowId, trigger_type: trigger.component_key }, 'Type de trigger non supporté');
      }

      logger.info({ workflow_id: workflowId }, 'Trigger redémarré');

    } catch (error) {
      logger.error({ error, workflow_id: workflowId }, 'Erreur redémarrage trigger');
      throw error;
    }
  }

  /**
   * Crée un nouveau trigger pour un workflow
   */
  async createTrigger(workflowId, triggerType, config = {}) {
    try {
      switch (triggerType) {
        case 'webhook':
          return await this.createWebhookTrigger(workflowId, config);
          
        case 'schedule':
          return await this.createScheduleTrigger(workflowId, config);
          
        default:
          throw new Error(`Type de trigger non supporté: ${triggerType}`);
      }
    } catch (error) {
      logger.error({ error, workflow_id: workflowId, trigger_type: triggerType }, 'Erreur création trigger');
      throw error;
    }
  }

  /**
   * Crée un trigger webhook
   */
  async createWebhookTrigger(workflowId, config) {
    // Créer le noeud trigger dans la base
    const nodeResult = await pool.query(`
      INSERT INTO workflow_nodes (workflow_id, node_id, node_type, component_key, config)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [
      workflowId,
      `webhook_trigger_${Date.now()}`,
      'trigger',
      'webhook-trigger',
      config
    ]);

    // Créer l'endpoint webhook
    const webhook = await this.webhookManager.createWebhook(workflowId, config);

    return {
      node: nodeResult.rows[0],
      webhook
    };
  }

  /**
   * Crée un trigger programmé
   */
  async createScheduleTrigger(workflowId, config) {
    const { cron, timezone = 'UTC' } = config;

    if (!cron) {
      throw new Error('Expression cron requise');
    }

    if (!cron.validate(cron)) {
      throw new Error('Expression cron invalide');
    }

    // Créer le noeud trigger dans la base
    const nodeResult = await pool.query(`
      INSERT INTO workflow_nodes (workflow_id, node_id, node_type, component_key, config)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [
      workflowId,
      `schedule_trigger_${Date.now()}`,
      'trigger',
      'schedule-trigger',
      { cron, timezone }
    ]);

    // Redémarrer le trigger pour ce workflow
    await this.restartWorkflowTrigger(workflowId);

    return {
      node: nodeResult.rows[0],
      schedule: {
        cron,
        timezone,
        nextRun: this.getNextRunTime(cron)
      }
    };
  }

  /**
   * Calcule la prochaine exécution d'une expression cron
   */
  getNextRunTime(cronExpression) {
    try {
      // Utiliser une lib comme node-cron ou cron-parser pour calculer
      // Pour l'instant, retourner une estimation
      return new Date(Date.now() + 60000).toISOString(); // Dans 1 minute
    } catch (error) {
      return null;
    }
  }

  /**
   * Récupère les statistiques des triggers
   */
  async getTriggerStats(workflowId) {
    try {
      const stats = {
        webhooks: [],
        schedules: [],
        totalTriggers: 0,
        activeTriggers: 0
      };

      // Stats webhooks
      const webhooks = await this.webhookManager.getWorkflowWebhooks(workflowId);
      stats.webhooks = webhooks;
      stats.totalTriggers += webhooks.length;
      stats.activeTriggers += webhooks.filter(w => w.is_active).length;

      // Stats schedules
      const scheduleResult = await pool.query(`
        SELECT * FROM workflow_nodes 
        WHERE workflow_id = $1 AND node_type = 'trigger' AND component_key = 'schedule-trigger'
      `, [workflowId]);

      stats.schedules = scheduleResult.rows.map(node => ({
        ...node,
        isRunning: this.scheduledTasks.has(workflowId),
        nextRun: this.getNextRunTime(node.config.cron)
      }));

      stats.totalTriggers += stats.schedules.length;
      stats.activeTriggers += stats.schedules.filter(s => s.isRunning).length;

      return stats;

    } catch (error) {
      logger.error({ error, workflow_id: workflowId }, 'Erreur récupération stats triggers');
      throw error;
    }
  }

  /**
   * Teste un trigger manuellement
   */
  async testTrigger(workflowId, triggerType = 'manual') {
    try {
      const triggerData = {
        trigger: triggerType,
        test: true,
        triggeredAt: new Date().toISOString(),
        message: 'Test manuel du trigger'
      };

      logger.info({ workflow_id: workflowId }, 'Test manuel du trigger');

      const result = await this.workflowEngine.executeWorkflow(workflowId, triggerData);

      return {
        success: true,
        executionId: result.executionId,
        triggerData
      };

    } catch (error) {
      logger.error({ error, workflow_id: workflowId }, 'Erreur test trigger');
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Nettoie les anciens triggers inactifs
   */
  async cleanupInactiveTriggers() {
    try {
      // Supprimer les webhooks des workflows supprimés
      await pool.query(`
        DELETE FROM webhook_endpoints 
        WHERE workflow_id NOT IN (SELECT id FROM workflows)
      `);

      // Supprimer les noeuds trigger des workflows supprimés
      await pool.query(`
        DELETE FROM workflow_nodes 
        WHERE workflow_id NOT IN (SELECT id FROM workflows)
      `);

      // Recharger les webhooks actifs
      await this.webhookManager.loadActiveWebhooks();

      logger.info('Nettoyage des triggers inactifs terminé');

    } catch (error) {
      logger.error({ error }, 'Erreur nettoyage triggers');
    }
  }
}