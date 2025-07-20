import { logger } from '../utils/logger.js';

export class ConditionEvaluator {
  constructor() {
    this.operators = {
      // Comparaisons de base
      'equals': (a, b) => a === b,
      'not_equals': (a, b) => a !== b,
      'greater_than': (a, b) => Number(a) > Number(b),
      'greater_than_or_equal': (a, b) => Number(a) >= Number(b),
      'less_than': (a, b) => Number(a) < Number(b),
      'less_than_or_equal': (a, b) => Number(a) <= Number(b),
      
      // Texte
      'contains': (a, b) => String(a).toLowerCase().includes(String(b).toLowerCase()),
      'not_contains': (a, b) => !String(a).toLowerCase().includes(String(b).toLowerCase()),
      'starts_with': (a, b) => String(a).toLowerCase().startsWith(String(b).toLowerCase()),
      'ends_with': (a, b) => String(a).toLowerCase().endsWith(String(b).toLowerCase()),
      'regex_match': (a, b) => new RegExp(b, 'i').test(String(a)),
      
      // Arrays et objets
      'in': (a, b) => Array.isArray(b) ? b.includes(a) : String(b).split(',').map(s => s.trim()).includes(String(a)),
      'not_in': (a, b) => !(Array.isArray(b) ? b.includes(a) : String(b).split(',').map(s => s.trim()).includes(String(a))),
      
      // Existence
      'exists': (a) => a !== null && a !== undefined && a !== '',
      'not_exists': (a) => a === null || a === undefined || a === '',
      
      // Booléens
      'is_true': (a) => a === true || String(a).toLowerCase() === 'true',
      'is_false': (a) => a === false || String(a).toLowerCase() === 'false',
      
      // Nombres spéciaux
      'is_number': (a) => !isNaN(Number(a)) && isFinite(Number(a)),
      'is_email': (a) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(a))
    };
  }

  /**
   * Évalue une liste de conditions avec une logique AND/OR
   */
  evaluateConditions(conditions, logic = 'AND', context = {}) {
    if (!Array.isArray(conditions) || conditions.length === 0) {
      return true;
    }

    try {
      const results = conditions.map(condition => this.evaluateCondition(condition, context));
      
      if (logic.toUpperCase() === 'OR') {
        return results.some(result => result === true);
      } else {
        // AND par défaut
        return results.every(result => result === true);
      }

    } catch (error) {
      logger.error({ error, conditions, context }, 'Erreur évaluation conditions');
      return false;
    }
  }

  /**
   * Évalue une seule condition
   */
  evaluateCondition(condition, context = {}) {
    const { field, operator, value, field_type = 'auto' } = condition;

    if (!field || !operator) {
      logger.warn({ condition }, 'Condition incomplète');
      return false;
    }

    try {
      // Extraire la valeur du champ depuis le contexte
      const fieldValue = this.extractFieldValue(field, context);
      
      // Convertir les types si nécessaire
      const { convertedFieldValue, convertedValue } = this.convertTypes(
        fieldValue, 
        value, 
        field_type
      );

      // Appliquer l'opérateur
      const operatorFunc = this.operators[operator];
      if (!operatorFunc) {
        logger.warn({ operator }, 'Opérateur non supporté');
        return false;
      }

      const result = operatorFunc(convertedFieldValue, convertedValue);
      
      logger.debug({ 
        field, 
        fieldValue: convertedFieldValue, 
        operator, 
        value: convertedValue, 
        result 
      }, 'Évaluation condition');

      return result;

    } catch (error) {
      logger.error({ error, condition, context }, 'Erreur évaluation condition individuelle');
      return false;
    }
  }

  /**
   * Extrait la valeur d'un champ depuis le contexte
   * Supporte JSONPath-like syntax: trigger.body.email, variables.budget, nodes.calc_1.result
   */
  extractFieldValue(fieldPath, context) {
    try {
      const parts = fieldPath.split('.');
      const source = parts[0]; // trigger, variables, nodes, etc.
      
      let targetObject;
      
      switch (source) {
        case 'trigger':
          targetObject = context.triggerData || {};
          break;
          
        case 'variables':
          targetObject = context.variables || {};
          break;
          
        case 'nodes':
          if (parts.length < 2) return null;
          const nodeId = parts[1];
          const nodeResult = context.nodeResults?.get(nodeId);
          targetObject = nodeResult?.data || nodeResult || {};
          // Enlever 'nodes' et nodeId du path
          parts.splice(0, 2);
          break;
          
        case 'current':
          targetObject = context.currentResult?.data || context.currentResult || {};
          break;
          
        default:
          // Si pas de préfixe, chercher dans triggerData par défaut
          targetObject = context.triggerData || {};
          break;
      }

      // Naviguer dans l'objet selon le path restant
      const remainingPath = source === 'nodes' ? parts : parts.slice(1);
      return this.getNestedValue(targetObject, remainingPath.join('.'));

    } catch (error) {
      logger.warn({ error, fieldPath }, 'Erreur extraction valeur champ');
      return null;
    }
  }

  /**
   * Récupère une valeur imbriquée dans un objet
   */
  getNestedValue(obj, path) {
    if (!path) return obj;
    
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  /**
   * Convertit les types des valeurs pour la comparaison
   */
  convertTypes(fieldValue, compareValue, fieldType) {
    switch (fieldType) {
      case 'number':
        return {
          convertedFieldValue: Number(fieldValue),
          convertedValue: Number(compareValue)
        };
        
      case 'boolean':
        return {
          convertedFieldValue: this.toBoolean(fieldValue),
          convertedValue: this.toBoolean(compareValue)
        };
        
      case 'string':
        return {
          convertedFieldValue: String(fieldValue || ''),
          convertedValue: String(compareValue || '')
        };
        
      case 'array':
        return {
          convertedFieldValue: Array.isArray(fieldValue) ? fieldValue : [fieldValue],
          convertedValue: Array.isArray(compareValue) ? compareValue : [compareValue]
        };
        
      case 'auto':
      default:
        // Auto-détection du type
        return this.autoConvertTypes(fieldValue, compareValue);
    }
  }

  /**
   * Conversion automatique des types
   */
  autoConvertTypes(fieldValue, compareValue) {
    // Si les deux sont des nombres
    if (!isNaN(Number(fieldValue)) && !isNaN(Number(compareValue))) {
      return {
        convertedFieldValue: Number(fieldValue),
        convertedValue: Number(compareValue)
      };
    }

    // Si les deux ressemblent à des booléens
    if (this.looksLikeBoolean(fieldValue) && this.looksLikeBoolean(compareValue)) {
      return {
        convertedFieldValue: this.toBoolean(fieldValue),
        convertedValue: this.toBoolean(compareValue)
      };
    }

    // Par défaut, traiter comme des strings
    return {
      convertedFieldValue: fieldValue,
      convertedValue: compareValue
    };
  }

  /**
   * Vérifie si une valeur ressemble à un booléen
   */
  looksLikeBoolean(value) {
    if (typeof value === 'boolean') return true;
    const str = String(value).toLowerCase();
    return ['true', 'false', '1', '0', 'yes', 'no', 'on', 'off'].includes(str);
  }

  /**
   * Convertit une valeur en booléen
   */
  toBoolean(value) {
    if (typeof value === 'boolean') return value;
    const str = String(value).toLowerCase();
    return ['true', '1', 'yes', 'on'].includes(str);
  }

  /**
   * Valide la syntaxe d'une condition
   */
  validateCondition(condition) {
    const errors = [];

    if (!condition.field) {
      errors.push('Champ requis');
    }

    if (!condition.operator) {
      errors.push('Opérateur requis');
    } else if (!this.operators[condition.operator]) {
      errors.push(`Opérateur '${condition.operator}' non supporté`);
    }

    // Certains opérateurs n'ont pas besoin de valeur
    const noValueOperators = ['exists', 'not_exists', 'is_true', 'is_false', 'is_number', 'is_email'];
    if (!noValueOperators.includes(condition.operator) && condition.value === undefined) {
      errors.push('Valeur requise pour cet opérateur');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Retourne la liste des opérateurs disponibles avec descriptions
   */
  getAvailableOperators() {
    return {
      // Comparaisons
      'equals': { name: 'Égal à', description: 'La valeur est exactement égale' },
      'not_equals': { name: 'Différent de', description: 'La valeur est différente' },
      'greater_than': { name: 'Supérieur à', description: 'La valeur numérique est supérieure' },
      'greater_than_or_equal': { name: 'Supérieur ou égal à', description: 'La valeur numérique est supérieure ou égale' },
      'less_than': { name: 'Inférieur à', description: 'La valeur numérique est inférieure' },
      'less_than_or_equal': { name: 'Inférieur ou égal à', description: 'La valeur numérique est inférieure ou égale' },
      
      // Texte
      'contains': { name: 'Contient', description: 'Le texte contient la sous-chaîne' },
      'not_contains': { name: 'Ne contient pas', description: 'Le texte ne contient pas la sous-chaîne' },
      'starts_with': { name: 'Commence par', description: 'Le texte commence par la valeur' },
      'ends_with': { name: 'Finit par', description: 'Le texte finit par la valeur' },
      'regex_match': { name: 'Expression régulière', description: 'Le texte correspond au pattern regex' },
      
      // Arrays
      'in': { name: 'Dans la liste', description: 'La valeur est présente dans la liste' },
      'not_in': { name: 'Pas dans la liste', description: 'La valeur n\'est pas présente dans la liste' },
      
      // Existence
      'exists': { name: 'Existe', description: 'Le champ existe et n\'est pas vide' },
      'not_exists': { name: 'N\'existe pas', description: 'Le champ n\'existe pas ou est vide' },
      
      // Booléens
      'is_true': { name: 'Est vrai', description: 'La valeur est vraie' },
      'is_false': { name: 'Est faux', description: 'La valeur est fausse' },
      
      // Types
      'is_number': { name: 'Est un nombre', description: 'La valeur est un nombre valide' },
      'is_email': { name: 'Est un email', description: 'La valeur est un email valide' }
    };
  }

  /**
   * Crée une condition de test pour les workflows
   */
  createTestCondition(field, operator, value, fieldType = 'auto') {
    const condition = {
      field,
      operator,
      value,
      field_type: fieldType
    };

    const validation = this.validateCondition(condition);
    if (!validation.isValid) {
      throw new Error(`Condition invalide: ${validation.errors.join(', ')}`);
    }

    return condition;
  }
}