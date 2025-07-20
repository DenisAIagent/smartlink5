import fs from 'fs';
import path from 'path';
import pool from './pool.js';
import { logger } from '../utils/logger.js';

/**
 * Migration automatique de la base de données au démarrage
 */
export async function migrateDatabase() {
  try {
    logger.info('Démarrage migration base de données...');

    // Vérifier si les nouvelles tables existent
    const tablesCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('workflow_nodes', 'webhook_endpoints')
    `);

    if (tablesCheck.rows.length === 2) {
      logger.info('Base de données déjà migrée vers v2.1');
      return;
    }

    // Lire et exécuter le schéma v2
    const schemaPath = path.join(new URL('.', import.meta.url).pathname, 'schema-v2.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Diviser en commandes individuelles et exécuter
    const commands = schemaSql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    for (const command of commands) {
      try {
        await pool.query(command);
      } catch (error) {
        // Ignorer les erreurs "already exists"
        if (!error.message.includes('already exists')) {
          logger.warn({ error: error.message, command: command.substring(0, 100) }, 'Erreur migration non critique');
        }
      }
    }

    logger.info('Migration base de données terminée avec succès');

  } catch (error) {
    logger.error({ error }, 'Erreur critique lors de la migration');
    throw error;
  }
}

/**
 * Vérification et création de la structure de base si nécessaire
 */
export async function ensureBaseStructure() {
  try {
    // Vérifier que la table users existe (structure de base)
    const usersCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (!usersCheck.rows[0].exists) {
      logger.info('Création structure de base...');
      
      // Lire et exécuter le schéma de base
      const schemaPath = path.join(new URL('.', import.meta.url).pathname, 'schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      
      await pool.query(schemaSql);
      logger.info('Structure de base créée');
    }
  } catch (error) {
    logger.error({ error }, 'Erreur création structure de base');
    throw error;
  }
}

/**
 * Initialisation complète de la base de données
 */
export async function initializeDatabase() {
  await ensureBaseStructure();
  await migrateDatabase();
  logger.info('Base de données initialisée et prête');
}