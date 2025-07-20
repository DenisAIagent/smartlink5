import { logger } from '../utils/logger.js';

/**
 * Classe utilitaire pour l'exécution des noeuds
 * Contient les méthodes communes et helpers pour tous types de noeuds
 */
export class NodeExecutor {
  constructor() {
    this.executionTimeout = 30000; // 30 secondes timeout par défaut
  }

  /**
   * Exécute un noeud avec timeout et gestion d'erreurs
   */
  async executeWithTimeout(nodeFunction, context, timeout = this.executionTimeout) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout d'exécution dépassé (${timeout}ms)`));
      }, timeout);

      nodeFunction(context)
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Valide la configuration d'un noeud
   */
  validateNodeConfig(node, requiredFields = []) {
    const errors = [];

    if (!node.node_id) {
      errors.push('node_id manquant');
    }

    if (!node.node_type) {
      errors.push('node_type manquant');
    }

    if (!node.config) {
      errors.push('config manquante');
    } else {
      // Vérifier les champs requis
      requiredFields.forEach(field => {
        if (node.config[field] === undefined || node.config[field] === null) {
          errors.push(`Champ requis manquant: ${field}`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Prépare les données d'entrée pour un noeud
   */
  prepareNodeInput(node, context) {
    return {
      nodeId: node.node_id,
      nodeType: node.node_type,
      config: node.config,
      executionId: context.executionId,
      workflowId: context.workflowId,
      userId: context.userId,
      triggerData: context.triggerData,
      variables: context.variables,
      previousResults: this.getPreviousResults(node, context)
    };
  }

  /**
   * Récupère les résultats des noeuds précédents
   */
  getPreviousResults(currentNode, context) {
    const results = {};
    
    context.nodeResults.forEach((result, nodeId) => {
      if (nodeId !== currentNode.node_id) {
        results[nodeId] = result;
      }
    });

    return results;
  }

  /**
   * Formatte le résultat d'un noeud
   */
  formatNodeResult(node, result, duration, error = null) {
    const baseResult = {
      nodeId: node.node_id,
      nodeType: node.node_type,
      executedAt: new Date().toISOString(),
      duration,
      success: !error
    };

    if (error) {
      return {
        ...baseResult,
        error: {
          message: error.message,
          type: error.constructor.name,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
      };
    }

    return {
      ...baseResult,
      data: result
    };
  }

  /**
   * Résout les templates dans une chaîne (ex: "Hello {{name}}")
   */
  resolveTemplate(template, context) {
    if (typeof template !== 'string') {
      return template;
    }

    let resolved = template;

    // Variables simples {{variable}}
    resolved = resolved.replace(/\{\{([^}]+)\}\}/g, (match, expression) => {
      try {
        const value = this.evaluateExpression(expression.trim(), context);
        return value !== undefined ? String(value) : match;
      } catch (error) {
        logger.warn({ error, expression, template }, 'Erreur résolution template');
        return match;
      }
    });

    return resolved;
  }

  /**
   * Évalue une expression dans un contexte
   */
  evaluateExpression(expression, context) {
    // Expressions de base: trigger.body.name, variables.email, etc.
    const parts = expression.split('.');
    const source = parts[0];

    let targetObject;
    switch (source) {
      case 'trigger':
        targetObject = context.triggerData;
        break;
      case 'variables':
        targetObject = context.variables;
        break;
      case 'nodes':
        if (parts.length < 2) return undefined;
        const nodeId = parts[1];
        const nodeResult = context.nodeResults?.get(nodeId);
        targetObject = nodeResult?.data || nodeResult;
        // Ajuster le path
        parts.splice(0, 2);
        break;
      default:
        return undefined;
    }

    // Naviguer dans l'objet
    const path = parts.slice(1);
    return this.getNestedValue(targetObject, path);
  }

  /**
   * Récupère une valeur imbriquée
   */
  getNestedValue(obj, pathArray) {
    return pathArray.reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Résout toutes les variables dans un objet de configuration
   */
  resolveAllVariables(config, context) {
    if (typeof config === 'string') {
      return this.resolveTemplate(config, context);
    }

    if (Array.isArray(config)) {
      return config.map(item => this.resolveAllVariables(item, context));
    }

    if (config && typeof config === 'object') {
      const resolved = {};
      for (const [key, value] of Object.entries(config)) {
        resolved[key] = this.resolveAllVariables(value, context);
      }
      return resolved;
    }

    return config;
  }

  /**
   * Valide le résultat d'un noeud
   */
  validateNodeResult(result, node) {
    if (result === null || result === undefined) {
      throw new Error(`Le noeud ${node.node_id} a retourné une valeur nulle`);
    }

    // Les résultats doivent être sérialisables
    try {
      JSON.stringify(result);
    } catch (error) {
      throw new Error(`Le résultat du noeud ${node.node_id} n'est pas sérialisable: ${error.message}`);
    }

    return true;
  }

  /**
   * Nettoie les données sensibles d'un résultat avant logging
   */
  sanitizeForLogging(data) {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sensitiveKeys = [
      'password', 'secret', 'token', 'key', 'auth', 'credential',
      'api_key', 'apikey', 'bearer', 'authorization'
    ];

    const sanitized = Array.isArray(data) ? [] : {};

    for (const [key, value] of Object.entries(data)) {
      const keyLower = key.toLowerCase();
      const isSensitive = sensitiveKeys.some(sensitiveKey => keyLower.includes(sensitiveKey));

      if (isSensitive && typeof value === 'string') {
        sanitized[key] = '***REDACTED***';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeForLogging(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Crée un contexte d'erreur standardisé
   */
  createErrorContext(error, node, context) {
    return {
      error: {
        message: error.message,
        type: error.constructor.name,
        code: error.code || 'UNKNOWN_ERROR'
      },
      node: {
        id: node.node_id,
        type: node.node_type,
        component: node.component_key
      },
      execution: {
        id: context.executionId,
        workflowId: context.workflowId,
        userId: context.userId
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Mesure le temps d'exécution d'une fonction
   */
  async measureExecutionTime(asyncFunction) {
    const startTime = process.hrtime.bigint();
    
    try {
      const result = await asyncFunction();
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
      
      return { result, duration };
    } catch (error) {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000;
      
      throw Object.assign(error, { duration });
    }
  }

  /**
   * Retries une fonction avec backoff exponentiel
   */
  async retryWithBackoff(asyncFunction, maxRetries = 3, baseDelay = 1000) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await asyncFunction();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          break;
        }

        const delay = baseDelay * Math.pow(2, attempt - 1);
        logger.debug({ attempt, delay, error: error.message }, 'Retry après erreur');
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Valide que les permissions sont suffisantes pour exécuter un noeud
   */
  async validatePermissions(node, context) {
    // Vérifications de base selon le type de noeud
    switch (node.node_type) {
      case 'action':
        // Vérifier que l'utilisateur peut exécuter des actions
        if (!context.userId) {
          throw new Error('Utilisateur requis pour exécuter des actions');
        }
        break;
        
      case 'condition':
        // Les conditions peuvent être exécutées par tous
        break;
        
      default:
        // Types inconnus nécessitent une validation
        logger.warn({ node_type: node.node_type }, 'Type de noeud non validé');
    }

    return true;
  }
}