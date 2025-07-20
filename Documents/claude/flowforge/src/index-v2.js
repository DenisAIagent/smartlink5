import Fastify from 'fastify';
import staticPlugin from '@fastify/static';
import path from 'path';
import fetch from 'node-fetch';
import pool from './db/pool.js';
import { config } from './config.js';
import { initializeDatabase } from './db/migrate.js';
import { logger } from './utils/logger.js';
import { authManager } from './auth.js';
import { integrationsManager } from './integrations.js';
import { chatManager } from './chat.js';
import { workflowEngine } from './engine/workflow-engine.js';
import './scheduler.js'; // Démarre le scheduler

const app = Fastify({ logger: true });

// Middleware d'authentification
async function authenticateRequest(request, reply) {
  const authHeader = request.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'Token d\'authentification requis' });
  }

  const token = authHeader.substring(7);
  const session = await authManager.validateSession(token);
  
  if (!session) {
    return reply.code(401).send({ error: 'Session invalide ou expirée' });
  }

  request.user = session;
}

// Middleware d'autorisation admin
async function requireAdmin(request, reply) {
  if (request.user.role !== 'admin') {
    return reply.code(403).send({ error: 'Accès administrateur requis' });
  }
}

// Configuration CORS pour le développement
app.register(async function (fastify) {
  fastify.addHook('onRequest', async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (request.method === 'OPTIONS') {
      reply.code(200).send();
    }
  });
});

// Servir les fichiers statiques
app.register(staticPlugin, {
  root: path.join(new URL('.', import.meta.url).pathname, '../public'),
  prefix: '/'
});

// Route de santé
app.get('/health', async () => ({ 
  status: 'ok', 
  timestamp: new Date().toISOString(),
  version: '2.1.0'
}));

// ===== ROUTES D'AUTHENTIFICATION =====

// Inscription
app.post('/v1/auth/register', async (request, reply) => {
  const { firstName, lastName, email, password } = request.body;
  
  if (!firstName || !lastName || !email || !password) {
    return reply.code(400).send({ error: 'Tous les champs sont requis' });
  }

  if (password.length < 6) {
    return reply.code(400).send({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
  }

  try {
    const result = await authManager.createUser({
      firstName,
      lastName,
      email,
      password
    });

    reply.code(201).send({
      message: 'Utilisateur créé avec succès',
      user: result.user
    });
  } catch (error) {
    logger.error({ error }, 'Erreur inscription');
    reply.code(400).send({ error: error.message });
  }
});

// Connexion
app.post('/v1/auth/login', async (request, reply) => {
  const { email, password } = request.body;
  
  if (!email || !password) {
    return reply.code(400).send({ error: 'Email et mot de passe requis' });
  }

  try {
    const user = await authManager.authenticateUser(email, password);
    const session = await authManager.createSession(
      user.id,
      request.ip,
      request.headers['user-agent']
    );

    reply.send({
      message: 'Connexion réussie',
      user,
      sessionToken: session.sessionToken
    });
  } catch (error) {
    logger.error({ error, email }, 'Erreur connexion');
    reply.code(401).send({ error: error.message });
  }
});

// Validation de session
app.get('/v1/auth/validate', { preHandler: authenticateRequest }, async (request, reply) => {
  reply.send({
    valid: true,
    user: request.user
  });
});

// Déconnexion
app.post('/v1/auth/logout', { preHandler: authenticateRequest }, async (request, reply) => {
  const token = request.headers.authorization.substring(7);
  await authManager.destroySession(token);
  
  reply.send({ message: 'Déconnexion réussie' });
});

// ===== ROUTES DE CHAT =====

// Démarrer une conversation
app.post('/v1/chat/start', { preHandler: authenticateRequest }, async (request, reply) => {
  try {
    const conversation = await chatManager.startConversation(request.user.userId);
    reply.send({ conversation });
  } catch (error) {
    logger.error({ error, user_id: request.user.userId }, 'Erreur démarrage conversation');
    reply.code(500).send({ error: 'Erreur lors du démarrage de la conversation' });
  }
});

// Obtenir les messages d'une conversation
app.get('/v1/chat/:sessionId/messages', { preHandler: authenticateRequest }, async (request, reply) => {
  try {
    const conversation = await chatManager.getConversation(request.params.sessionId, request.user.userId);
    const messages = await chatManager.getMessages(conversation.id);
    reply.send(messages);
  } catch (error) {
    logger.error({ error, session_id: request.params.sessionId }, 'Erreur récupération messages');
    reply.code(404).send({ error: 'Conversation non trouvée' });
  }
});

// Envoyer un message
app.post('/v1/chat/:sessionId/message', { preHandler: authenticateRequest }, async (request, reply) => {
  const { message } = request.body;
  
  if (!message || !message.trim()) {
    return reply.code(400).send({ error: 'Message requis' });
  }

  try {
    const response = await chatManager.processUserMessage(
      request.params.sessionId,
      request.user.userId,
      message.trim()
    );
    
    reply.send(response);
  } catch (error) {
    logger.error({ error, session_id: request.params.sessionId }, 'Erreur traitement message');
    reply.code(500).send({ error: 'Erreur lors du traitement du message' });
  }
});

// Lister les conversations de l'utilisateur
app.get('/v1/chat/conversations', { preHandler: authenticateRequest }, async (request, reply) => {
  try {
    const conversations = await chatManager.getUserConversations(request.user.userId);
    reply.send(conversations);
  } catch (error) {
    logger.error({ error, user_id: request.user.userId }, 'Erreur récupération conversations');
    reply.code(500).send({ error: 'Erreur lors de la récupération des conversations' });
  }
});

// ===== ROUTES D'INTÉGRATIONS =====

// Lister les intégrations de l'utilisateur
app.get('/v1/integrations', { preHandler: authenticateRequest }, async (request, reply) => {
  try {
    const integrations = await integrationsManager.listIntegrations();
    // Filtrer par utilisateur
    const userIntegrations = integrations.filter(int => int.user_id === request.user.userId);
    reply.send(userIntegrations);
  } catch (error) {
    logger.error({ error, user_id: request.user.userId }, 'Erreur listage intégrations');
    reply.code(500).send({ error: 'Erreur lors de la récupération des intégrations' });
  }
});

// Créer/modifier une intégration
app.post('/v1/integrations', { preHandler: authenticateRequest }, async (request, reply) => {
  const { serviceKey, displayName, credentials, config } = request.body;
  
  if (!serviceKey || !displayName || !credentials) {
    return reply.code(400).send({ error: 'Service, nom d\'affichage et credentials requis' });
  }

  try {
    const integration = await integrationsManager.saveIntegration(
      serviceKey,
      displayName,
      credentials,
      config || {}
    );
    
    reply.code(201).send(integration);
  } catch (error) {
    logger.error({ error, user_id: request.user.userId }, 'Erreur sauvegarde intégration');
    reply.code(400).send({ error: error.message });
  }
});

// Tester une intégration
app.post('/v1/integrations/:id/test', { preHandler: authenticateRequest }, async (request, reply) => {
  try {
    const result = await integrationsManager.testConnection(request.params.id);
    reply.send(result);
  } catch (error) {
    logger.error({ error, integration_id: request.params.id }, 'Erreur test intégration');
    reply.code(500).send({ error: 'Erreur lors du test de connexion' });
  }
});

// Supprimer une intégration
app.delete('/v1/integrations/:id', { preHandler: authenticateRequest }, async (request, reply) => {
  try {
    await integrationsManager.deleteIntegration(request.params.id);
    reply.code(204).send();
  } catch (error) {
    logger.error({ error, integration_id: request.params.id }, 'Erreur suppression intégration');
    reply.code(500).send({ error: 'Erreur lors de la suppression' });
  }
});

// ===== NOUVELLES ROUTES WORKFLOWS V2 =====

// Créer un nouveau workflow moderne
app.post('/v2/workflows', { preHandler: authenticateRequest }, async (request, reply) => {
  const { name, description, nodes = [], connections = [] } = request.body;
  
  if (!name) {
    return reply.code(400).send({ error: 'Nom du workflow requis' });
  }

  try {
    // Créer le workflow de base
    const workflowResult = await pool.query(
      'INSERT INTO workflows(user_id, name, version, workflow_data) VALUES($1,$2,$3,$4) RETURNING *',
      [request.user.userId, name, 2, { description, created_with: 'v2_api' }]
    );

    const workflow = workflowResult.rows[0];
    const workflowId = workflow.id;

    // Créer les noeuds
    for (const node of nodes) {
      await pool.query(
        `INSERT INTO workflow_nodes (workflow_id, node_id, node_type, component_key, config, position_x, position_y)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          workflowId,
          node.id,
          node.type,
          node.component || null,
          node.config || {},
          node.position?.x || 0,
          node.position?.y || 0
        ]
      );
    }

    // Créer les connexions
    for (const connection of connections) {
      await pool.query(
        `INSERT INTO workflow_connections (workflow_id, from_node_id, to_node_id, condition_type, condition_config)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          workflowId,
          connection.from,
          connection.to,
          connection.condition || 'always',
          connection.conditionConfig || {}
        ]
      );
    }

    logger.info({ workflow_id: workflowId, user_id: request.user.userId }, 'Workflow v2 créé');
    reply.code(201).send({ ...workflow, nodes, connections });

  } catch (error) {
    logger.error({ error, user_id: request.user.userId }, 'Erreur création workflow v2');
    reply.code(500).send({ error: 'Erreur lors de la création du workflow' });
  }
});

// Exécuter un workflow manuellement
app.post('/v2/workflows/:id/execute', { preHandler: authenticateRequest }, async (request, reply) => {
  const { triggerData = {} } = request.body;
  
  try {
    const result = await workflowEngine.executeWorkflow(
      parseInt(request.params.id),
      triggerData,
      request.user.userId
    );
    
    reply.send({
      message: 'Workflow exécuté avec succès',
      result
    });
  } catch (error) {
    logger.error({ error, workflow_id: request.params.id }, 'Erreur exécution workflow');
    reply.code(500).send({ error: error.message });
  }
});

// ===== ROUTES WEBHOOKS =====

// Endpoint générique pour recevoir les webhooks
app.all('/webhook/:path', async (request, reply) => {
  await workflowEngine.triggerManager.webhookManager.handleWebhookRequest(
    request.params.path,
    request,
    reply
  );
});

// Créer un webhook pour un workflow
app.post('/v2/workflows/:id/webhooks', { preHandler: authenticateRequest }, async (request, reply) => {
  const { method = 'POST', useSecret = false } = request.body;
  
  try {
    const webhook = await workflowEngine.triggerManager.createTrigger(
      parseInt(request.params.id),
      'webhook',
      { method, useSecret }
    );
    
    reply.code(201).send(webhook);
  } catch (error) {
    logger.error({ error, workflow_id: request.params.id }, 'Erreur création webhook');
    reply.code(500).send({ error: error.message });
  }
});

// Lister les webhooks d'un workflow
app.get('/v2/workflows/:id/webhooks', { preHandler: authenticateRequest }, async (request, reply) => {
  try {
    const webhooks = await workflowEngine.triggerManager.webhookManager.getWorkflowWebhooks(
      parseInt(request.params.id)
    );
    reply.send(webhooks);
  } catch (error) {
    logger.error({ error, workflow_id: request.params.id }, 'Erreur récupération webhooks');
    reply.code(500).send({ error: 'Erreur lors de la récupération des webhooks' });
  }
});

// Tester un webhook
app.post('/v2/webhooks/:id/test', { preHandler: authenticateRequest }, async (request, reply) => {
  try {
    const result = await workflowEngine.triggerManager.webhookManager.testWebhook(
      parseInt(request.params.id)
    );
    reply.send(result);
  } catch (error) {
    logger.error({ error, webhook_id: request.params.id }, 'Erreur test webhook');
    reply.code(500).send({ error: error.message });
  }
});

// ===== ROUTES CONDITIONS =====

// Tester des conditions
app.post('/v2/conditions/test', { preHandler: authenticateRequest }, async (request, reply) => {
  const { conditions, logic = 'AND', testData = {} } = request.body;
  
  if (!conditions || !Array.isArray(conditions)) {
    return reply.code(400).send({ error: 'Conditions requises' });
  }

  try {
    const conditionEvaluator = workflowEngine.conditionEvaluator;
    const result = conditionEvaluator.evaluateConditions(conditions, logic, {
      triggerData: testData
    });
    
    reply.send({
      result,
      conditions,
      logic,
      testData
    });
  } catch (error) {
    logger.error({ error }, 'Erreur test conditions');
    reply.code(500).send({ error: error.message });
  }
});

// Lister les opérateurs disponibles
app.get('/v2/conditions/operators', async (request, reply) => {
  const operators = workflowEngine.conditionEvaluator.getAvailableOperators();
  reply.send(operators);
});

// ===== ROUTES LEGACY (COMPATIBILITÉ V1) =====

// Lister les workflows de l'utilisateur
app.get('/v1/workflows', { preHandler: authenticateRequest }, async (request, reply) => {
  try {
    const result = await pool.query(
      'SELECT * FROM workflows WHERE user_id = $1 ORDER BY created_at DESC',
      [request.user.userId]
    );
    reply.send(result.rows);
  } catch (error) {
    logger.error({ error, user_id: request.user.userId }, 'Erreur listage workflows');
    reply.code(500).send({ error: 'Erreur lors de la récupération des workflows' });
  }
});

// Obtenir un workflow spécifique
app.get('/v1/workflows/:id', { preHandler: authenticateRequest }, async (request, reply) => {
  try {
    const workflow = await workflowEngine.getWorkflowWithNodes(request.params.id);
    
    if (!workflow || workflow.user_id !== request.user.userId) {
      return reply.code(404).send({ error: 'Workflow non trouvé' });
    }
    
    reply.send(workflow);
  } catch (error) {
    logger.error({ error, workflow_id: request.params.id }, 'Erreur récupération workflow');
    reply.code(500).send({ error: 'Erreur lors de la récupération du workflow' });
  }
});

// Créer un workflow depuis un prompt (legacy)
app.post('/v1/workflows/create-from-prompt', { preHandler: authenticateRequest }, async (request, reply) => {
  const { prompt } = request.body;
  
  if (!prompt) {
    return reply.code(400).send({ error: 'Le prompt est requis' });
  }

  const ALLOWED_COMPONENTS = [
    'discord_webhook-send_message',
    'slack-send_message',
    'github-create_issue',
    'google-sheets-append',
    'email-send',
    'http-request'
  ];

  const systemPrompt = `Vous êtes un expert en automatisation. Traduisez la demande de l'utilisateur en un objet JSON unique et valide pour FlowForge.
Le JSON doit contenir les clés "name", "trigger_config", "action_key", et "action_props".
Les valeurs de "action_key" doivent provenir de cette liste : ${ALLOWED_COMPONENTS.join(', ')}.
Répondez UNIQUEMENT avec le bloc de code JSON, sans aucun autre texte.`;

  try {
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024
      })
    });

    if (!claudeRes.ok) {
      throw new Error(`Erreur Claude API: ${claudeRes.status}`);
    }

    const claudeData = await claudeRes.json();
    const jsonString = claudeData.content[0].text;
    const workflow = JSON.parse(jsonString);

    // Validation des champs requis
    if (!workflow.name || !workflow.trigger_config || !workflow.action_key || !workflow.action_props) {
      throw new Error('Workflow généré invalide - champs manquants');
    }

    // Validation de l'action_key
    if (!ALLOWED_COMPONENTS.includes(workflow.action_key)) {
      throw new Error(`Action non autorisée: ${workflow.action_key}`);
    }

    const insert = await pool.query(
      'INSERT INTO workflows(user_id, name, trigger_config, action_key, action_props) VALUES($1,$2,$3,$4,$5) RETURNING *',
      [request.user.userId, workflow.name, workflow.trigger_config, workflow.action_key, workflow.action_props]
    );

    logger.info({ workflow_id: insert.rows[0].id, user_id: request.user.userId }, 'Nouveau workflow créé');
    reply.code(201).send(insert.rows[0]);
  } catch (err) {
    logger.error({ error: err, user_id: request.user.userId }, 'Erreur création workflow depuis prompt');
    reply.code(500).send({ error: 'Impossible de générer le workflow.' });
  }
});

// Activer/désactiver un workflow
app.patch('/v1/workflows/:id', { preHandler: authenticateRequest }, async (request, reply) => {
  const { is_active } = request.body;
  
  try {
    const result = await pool.query(
      'UPDATE workflows SET is_active = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [is_active, request.params.id, request.user.userId]
    );
    
    if (result.rows.length === 0) {
      return reply.code(404).send({ error: 'Workflow non trouvé' });
    }
    
    // Redémarrer les triggers si nécessaire
    if (is_active) {
      await workflowEngine.triggerManager.restartWorkflowTrigger(parseInt(request.params.id));
    }
    
    reply.send(result.rows[0]);
  } catch (error) {
    logger.error({ error, workflow_id: request.params.id }, 'Erreur modification workflow');
    reply.code(500).send({ error: 'Erreur lors de la modification du workflow' });
  }
});

// Supprimer un workflow
app.delete('/v1/workflows/:id', { preHandler: authenticateRequest }, async (request, reply) => {
  try {
    const result = await pool.query(
      'DELETE FROM workflows WHERE id = $1 AND user_id = $2 RETURNING *',
      [request.params.id, request.user.userId]
    );
    
    if (result.rows.length === 0) {
      return reply.code(404).send({ error: 'Workflow non trouvé' });
    }
    
    reply.code(204).send();
  } catch (error) {
    logger.error({ error, workflow_id: request.params.id }, 'Erreur suppression workflow');
    reply.code(500).send({ error: 'Erreur lors de la suppression du workflow' });
  }
});

// ===== ROUTES DE LOGS =====

// Obtenir les logs d'exécution de l'utilisateur
app.get('/v1/logs', { preHandler: authenticateRequest }, async (request, reply) => {
  try {
    const result = await pool.query(
      `SELECT e.*, w.name as workflow_name 
       FROM executions e
       JOIN workflows w ON e.workflow_id = w.id
       WHERE w.user_id = $1
       ORDER BY e.started_at DESC 
       LIMIT 50`,
      [request.user.userId]
    );
    reply.send(result.rows);
  } catch (error) {
    logger.error({ error, user_id: request.user.userId }, 'Erreur récupération logs');
    reply.code(500).send({ error: 'Erreur lors de la récupération des logs' });
  }
});

// Obtenir les logs détaillés d'une exécution
app.get('/v2/executions/:id/contexts', { preHandler: authenticateRequest }, async (request, reply) => {
  try {
    const result = await pool.query(
      `SELECT ec.* FROM execution_contexts ec
       JOIN executions e ON ec.execution_id = e.id
       JOIN workflows w ON e.workflow_id = w.id
       WHERE ec.execution_id = $1 AND w.user_id = $2
       ORDER BY ec.started_at`,
      [request.params.id, request.user.userId]
    );
    reply.send(result.rows);
  } catch (error) {
    logger.error({ error, execution_id: request.params.id }, 'Erreur récupération contextes exécution');
    reply.code(500).send({ error: 'Erreur lors de la récupération des contextes' });
  }
});

// ===== ROUTES D'ADMINISTRATION =====

// Lister tous les utilisateurs (admin seulement)
app.get('/v1/admin/users', { 
  preHandler: [authenticateRequest, requireAdmin] 
}, async (request, reply) => {
  try {
    const users = await authManager.listUsers(request.user.userId, request.user.role);
    reply.send(users);
  } catch (error) {
    logger.error({ error, admin_id: request.user.userId }, 'Erreur listage utilisateurs admin');
    reply.code(500).send({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// Mettre à jour un utilisateur (admin ou utilisateur lui-même)
app.patch('/v1/admin/users/:id', { preHandler: authenticateRequest }, async (request, reply) => {
  try {
    const updatedUser = await authManager.updateUser(
      parseInt(request.params.id),
      request.body,
      request.user.userId,
      request.user.role
    );
    reply.send(updatedUser);
  } catch (error) {
    logger.error({ error, target_user_id: request.params.id }, 'Erreur mise à jour utilisateur');
    reply.code(400).send({ error: error.message });
  }
});

// Statistiques système (admin seulement)
app.get('/v1/admin/stats', { 
  preHandler: [authenticateRequest, requireAdmin] 
}, async (request, reply) => {
  try {
    const [usersCount, workflowsCount, executionsCount, webhooksCount] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM workflows'),
      pool.query('SELECT COUNT(*) FROM executions WHERE started_at > NOW() - INTERVAL \'24 hours\''),
      pool.query('SELECT COUNT(*) FROM webhook_endpoints WHERE is_active = true')
    ]);

    reply.send({
      total_users: parseInt(usersCount.rows[0].count),
      total_workflows: parseInt(workflowsCount.rows[0].count),
      executions_24h: parseInt(executionsCount.rows[0].count),
      active_webhooks: parseInt(webhooksCount.rows[0].count)
    });
  } catch (error) {
    logger.error({ error }, 'Erreur récupération statistiques');
    reply.code(500).send({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// Nettoyage périodique des sessions expirées
setInterval(async () => {
  await authManager.cleanupExpiredSessions();
}, 60 * 60 * 1000); // Toutes les heures

// Nettoyage périodique des triggers inactifs
setInterval(async () => {
  await workflowEngine.triggerManager.cleanupInactiveTriggers();
}, 24 * 60 * 60 * 1000); // Tous les jours

// Démarrer le serveur
async function start() {
  try {
    // Initialiser la base de données
    await initializeDatabase();
    
    // Démarrer les triggers
    await workflowEngine.startTriggerListeners();
    
    await app.listen({ port: config.port, host: '0.0.0.0' });
    logger.info(`🚀 FlowForge v2.1 démarré sur le port ${config.port}`);
    
    if (process.env.RAILWAY_PUBLIC_DOMAIN) {
      logger.info(`🌐 Application accessible sur: https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
    }
  } catch (err) {
    logger.error(err, 'Erreur de démarrage du serveur');
    process.exit(1);
  }
}

// Arrêt propre
process.on('SIGINT', async () => {
  logger.info('Arrêt du serveur...');
  await workflowEngine.stopTriggerListeners();
  process.exit(0);
});

start();