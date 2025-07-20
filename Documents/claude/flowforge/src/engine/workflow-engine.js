import pool from '../db/pool.js';
import { logger } from '../utils/logger.js';
import { NodeExecutor } from './node-executor.js';
import { ConditionEvaluator } from './condition-evaluator.js';
import { TriggerManager } from '../triggers/trigger-manager.js';
import { ComponentRunner } from '../component-runner.js';

export class WorkflowEngine {
  constructor() {
    this.nodeExecutor = new NodeExecutor();
    this.conditionEvaluator = new ConditionEvaluator();
    this.triggerManager = new TriggerManager();
    this.activeExecutions = new Map();
  }

  /**
   * Exécute un workflow complet depuis un trigger
   */
  async executeWorkflow(workflowId, triggerData = {}, userId = null) {
    const executionId = await this.createExecution(workflowId);
    
    try {
      logger.info({ workflow_id: workflowId, execution_id: executionId }, 'Démarrage exécution workflow');
      
      // Récupérer le workflow et ses noeuds
      const workflow = await this.getWorkflowWithNodes(workflowId);
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} non trouvé`);
      }

      // Créer le contexte d'exécution global
      const context = {
        executionId,
        workflowId,
        userId: userId || workflow.user_id,
        triggerData,
        variables: await this.getWorkflowVariables(workflowId),
        nodeResults: new Map()
      };

      // Trouver le noeud de démarrage (trigger)
      const startNode = workflow.nodes.find(node => node.node_type === 'trigger');
      if (!startNode) {
        throw new Error('Aucun noeud trigger trouvé dans le workflow');
      }

      // Exécuter le workflow à partir du trigger
      const result = await this.executeNode(startNode, workflow, context);
      
      await this.completeExecution(executionId, 'success', { finalResult: result });
      logger.info({ workflow_id: workflowId, execution_id: executionId }, 'Workflow exécuté avec succès');
      
      return result;

    } catch (error) {
      logger.error({ error, workflow_id: workflowId, execution_id: executionId }, 'Erreur exécution workflow');
      await this.completeExecution(executionId, 'failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Exécute un noeud spécifique et propage vers les suivants
   */
  async executeNode(node, workflow, context) {
    const startTime = Date.now();
    
    try {
      logger.debug({ node_id: node.node_id, node_type: node.node_type }, 'Exécution noeud');
      
      let result;
      
      // Exécuter selon le type de noeud
      switch (node.node_type) {
        case 'trigger':
          result = await this.executeTriggerNode(node, context);
          break;
          
        case 'condition':
          result = await this.executeConditionNode(node, context);
          break;
          
        case 'action':
          result = await this.executeActionNode(node, context);
          break;
          
        case 'merge':
          result = await this.executeMergeNode(node, context);
          break;
          
        default:
          throw new Error(`Type de noeud non supporté: ${node.node_type}`);
      }

      // Enregistrer le résultat du noeud
      context.nodeResults.set(node.node_id, result);
      
      // Enregistrer le contexte d'exécution pour debug
      await this.saveExecutionContext(context.executionId, node, context.triggerData, result, Date.now() - startTime);

      // Propager vers les noeuds suivants
      const nextNodes = await this.getNextNodes(node, workflow, result, context);
      
      if (nextNodes.length === 0) {
        return result; // Fin du workflow
      }

      // Exécuter les noeuds suivants (en parallèle si plusieurs branches)
      const nextResults = await Promise.all(
        nextNodes.map(nextNode => this.executeNode(nextNode, workflow, context))
      );

      return nextResults.length === 1 ? nextResults[0] : nextResults;

    } catch (error) {
      logger.error({ error, node_id: node.node_id }, 'Erreur exécution noeud');
      await this.saveExecutionContext(context.executionId, node, context.triggerData, null, Date.now() - startTime, error);
      throw error;
    }
  }

  /**
   * Exécute un noeud trigger (point d'entrée)
   */
  async executeTriggerNode(node, context) {
    // Le trigger ne fait que passer les données reçues
    return {
      success: true,
      data: context.triggerData,
      nodeId: node.node_id,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Exécute un noeud condition
   */
  async executeConditionNode(node, context) {
    const { conditions, logic = 'AND' } = node.config;
    
    if (!conditions || !Array.isArray(conditions)) {
      throw new Error('Configuration de conditions invalide');
    }

    const evaluationResult = this.conditionEvaluator.evaluateConditions(
      conditions,
      logic,
      context
    );

    return {
      success: true,
      conditionResult: evaluationResult,
      nodeId: node.node_id,
      conditions: conditions
    };
  }

  /**
   * Exécute un noeud action
   */
  async executeActionNode(node, context) {
    if (!node.component_key) {
      throw new Error('Component key manquant pour le noeud action');
    }

    // Utiliser l'ancien ComponentRunner pour la compatibilité
    const componentRunner = new ComponentRunner();
    
    // Résoudre les variables dans la config du noeud
    const resolvedConfig = this.resolveVariables(node.config, context);
    
    const result = await componentRunner.executeComponent(
      node.component_key,
      resolvedConfig,
      context.userId
    );

    return {
      success: true,
      data: result,
      nodeId: node.node_id,
      component: node.component_key
    };
  }

  /**
   * Exécute un noeud merge (combine plusieurs entrées)
   */
  async executeMergeNode(node, context) {
    // Pour l'instant, merge combine simplement toutes les données précédentes
    const allResults = Array.from(context.nodeResults.values());
    
    return {
      success: true,
      data: allResults,
      nodeId: node.node_id,
      mergedCount: allResults.length
    };
  }

  /**
   * Récupère les noeuds suivants à exécuter selon les connexions et conditions
   */
  async getNextNodes(currentNode, workflow, nodeResult, context) {
    const connections = workflow.connections.filter(conn => conn.from_node_id === currentNode.node_id);
    const nextNodes = [];

    for (const connection of connections) {
      let shouldExecute = true;

      // Évaluer la condition de la connexion
      if (connection.condition_type !== 'always') {
        shouldExecute = this.evaluateConnectionCondition(connection, nodeResult, context);
      }

      if (shouldExecute) {
        const nextNode = workflow.nodes.find(node => node.node_id === connection.to_node_id);
        if (nextNode) {
          nextNodes.push(nextNode);
        }
      }
    }

    return nextNodes;
  }

  /**
   * Évalue si une connexion doit être suivie
   */
  evaluateConnectionCondition(connection, nodeResult, context) {
    switch (connection.condition_type) {
      case 'always':
        return true;
        
      case 'true':
        return nodeResult.conditionResult === true;
        
      case 'false':
        return nodeResult.conditionResult === false;
        
      case 'custom':
        return this.conditionEvaluator.evaluateConditions(
          connection.condition_config.conditions || [],
          connection.condition_config.logic || 'AND',
          { ...context, currentResult: nodeResult }
        );
        
      default:
        return true;
    }
  }

  /**
   * Résout les variables dans une configuration (ex: {{trigger.body.email}})
   */
  resolveVariables(config, context) {
    const configStr = JSON.stringify(config);
    let resolved = configStr;

    // Remplacer les variables trigger
    resolved = resolved.replace(/\{\{trigger\.([^}]+)\}\}/g, (match, path) => {
      return this.getNestedValue(context.triggerData, path) || match;
    });

    // Remplacer les variables de workflow
    resolved = resolved.replace(/\{\{variables\.([^}]+)\}\}/g, (match, varName) => {
      return context.variables[varName] || match;
    });

    // Remplacer les références aux résultats de noeuds précédents
    resolved = resolved.replace(/\{\{nodes\.([^.]+)\.([^}]+)\}\}/g, (match, nodeId, path) => {
      const nodeResult = context.nodeResults.get(nodeId);
      return nodeResult ? this.getNestedValue(nodeResult, path) : match;
    });

    try {
      return JSON.parse(resolved);
    } catch (error) {
      logger.warn({ error, config, resolved }, 'Erreur résolution variables');
      return config;
    }
  }

  /**
   * Récupère une valeur imbriquée dans un objet (ex: "body.user.email")
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }

  /**
   * Récupère un workflow avec ses noeuds et connexions
   */
  async getWorkflowWithNodes(workflowId) {
    try {
      // Récupérer le workflow de base
      const workflowResult = await pool.query(
        'SELECT * FROM workflows WHERE id = $1',
        [workflowId]
      );

      if (workflowResult.rows.length === 0) {
        return null;
      }

      const workflow = workflowResult.rows[0];

      // Si c'est un ancien workflow (v1), le convertir
      if (!workflow.workflow_data && workflow.action_key) {
        return this.convertLegacyWorkflow(workflow);
      }

      // Récupérer les noeuds
      const nodesResult = await pool.query(
        'SELECT * FROM workflow_nodes WHERE workflow_id = $1 ORDER BY created_at',
        [workflowId]
      );

      // Récupérer les connexions
      const connectionsResult = await pool.query(
        'SELECT * FROM workflow_connections WHERE workflow_id = $1',
        [workflowId]
      );

      return {
        ...workflow,
        nodes: nodesResult.rows,
        connections: connectionsResult.rows
      };

    } catch (error) {
      logger.error({ error, workflow_id: workflowId }, 'Erreur récupération workflow');
      throw error;
    }
  }

  /**
   * Convertit un ancien workflow v1 en format v2
   */
  convertLegacyWorkflow(legacyWorkflow) {
    const triggerId = 'trigger_1';
    const actionId = 'action_1';

    return {
      ...legacyWorkflow,
      nodes: [
        {
          workflow_id: legacyWorkflow.id,
          node_id: triggerId,
          node_type: 'trigger',
          component_key: 'manual-trigger',
          config: legacyWorkflow.trigger_config || {}
        },
        {
          workflow_id: legacyWorkflow.id,
          node_id: actionId,
          node_type: 'action',
          component_key: legacyWorkflow.action_key,
          config: legacyWorkflow.action_props || {}
        }
      ],
      connections: [
        {
          workflow_id: legacyWorkflow.id,
          from_node_id: triggerId,
          to_node_id: actionId,
          condition_type: 'always'
        }
      ]
    };
  }

  /**
   * Récupère les variables d'un workflow
   */
  async getWorkflowVariables(workflowId) {
    try {
      const result = await pool.query(
        'SELECT variable_name, variable_value FROM workflow_variables WHERE workflow_id = $1',
        [workflowId]
      );

      const variables = {};
      result.rows.forEach(row => {
        variables[row.variable_name] = row.variable_value;
      });

      return variables;
    } catch (error) {
      logger.error({ error, workflow_id: workflowId }, 'Erreur récupération variables');
      return {};
    }
  }

  /**
   * Crée une nouvelle exécution
   */
  async createExecution(workflowId) {
    try {
      const result = await pool.query(
        'INSERT INTO executions (workflow_id, status) VALUES ($1, $2) RETURNING id',
        [workflowId, 'running']
      );
      return result.rows[0].id;
    } catch (error) {
      logger.error({ error, workflow_id: workflowId }, 'Erreur création exécution');
      throw error;
    }
  }

  /**
   * Complète une exécution
   */
  async completeExecution(executionId, status, logs = {}) {
    try {
      await pool.query(
        'UPDATE executions SET status = $1, finished_at = NOW(), logs = $2 WHERE id = $3',
        [status, JSON.stringify(logs), executionId]
      );
    } catch (error) {
      logger.error({ error, execution_id: executionId }, 'Erreur completion exécution');
    }
  }

  /**
   * Sauvegarde le contexte d'exécution d'un noeud
   */
  async saveExecutionContext(executionId, node, inputData, outputData, durationMs, error = null) {
    try {
      await pool.query(
        `INSERT INTO execution_contexts 
         (execution_id, node_id, node_type, input_data, output_data, error_data, duration_ms, finished_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [
          executionId,
          node.node_id,
          node.node_type,
          JSON.stringify(inputData),
          JSON.stringify(outputData),
          error ? JSON.stringify({message: error.message, stack: error.stack}) : null,
          durationMs
        ]
      );
    } catch (saveError) {
      logger.error({ error: saveError }, 'Erreur sauvegarde contexte exécution');
    }
  }

  /**
   * Démarre l'écoute des triggers actifs
   */
  async startTriggerListeners() {
    logger.info('Démarrage des listeners de triggers');
    await this.triggerManager.startAll(this);
  }

  /**
   * Arrête tous les triggers
   */
  async stopTriggerListeners() {
    logger.info('Arrêt des listeners de triggers');
    await this.triggerManager.stopAll();
  }
}

export const workflowEngine = new WorkflowEngine();