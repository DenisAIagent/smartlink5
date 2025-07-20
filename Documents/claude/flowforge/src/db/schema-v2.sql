-- FlowForge v2.1 - Migration vers architecture moderne
-- Exécuter après le schema.sql existant

-- Extension de la table workflows pour supporter la nouvelle architecture
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS workflow_data JSONB;
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT FALSE;

-- Table des noeuds de workflow (pour l'éditeur visuel futur)
CREATE TABLE IF NOT EXISTS workflow_nodes (
  id SERIAL PRIMARY KEY,
  workflow_id INTEGER REFERENCES workflows(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL, -- UUID du noeud dans le workflow
  node_type TEXT NOT NULL, -- trigger, condition, action, merge
  component_key TEXT, -- slack-send_message, github-create_issue, etc.
  config JSONB NOT NULL DEFAULT '{}',
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des connexions entre noeuds
CREATE TABLE IF NOT EXISTS workflow_connections (
  id SERIAL PRIMARY KEY,
  workflow_id INTEGER REFERENCES workflows(id) ON DELETE CASCADE,
  from_node_id TEXT NOT NULL,
  to_node_id TEXT NOT NULL,
  condition_type TEXT DEFAULT 'always', -- always, true, false, custom
  condition_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des endpoints webhook
CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id SERIAL PRIMARY KEY,
  workflow_id INTEGER REFERENCES workflows(id) ON DELETE CASCADE,
  webhook_path TEXT UNIQUE NOT NULL,
  http_method TEXT DEFAULT 'POST',
  is_active BOOLEAN DEFAULT TRUE,
  secret_token TEXT, -- Pour sécuriser les webhooks
  last_triggered_at TIMESTAMPTZ,
  total_triggers INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des variables de workflow (pour stocker des valeurs entre exécutions)
CREATE TABLE IF NOT EXISTS workflow_variables (
  id SERIAL PRIMARY KEY,
  workflow_id INTEGER REFERENCES workflows(id) ON DELETE CASCADE,
  variable_name TEXT NOT NULL,
  variable_value JSONB,
  is_encrypted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workflow_id, variable_name)
);

-- Table des contextes d'exécution (pour debug et monitoring)
CREATE TABLE IF NOT EXISTS execution_contexts (
  id SERIAL PRIMARY KEY,
  execution_id INTEGER REFERENCES executions(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL,
  node_type TEXT NOT NULL,
  input_data JSONB,
  output_data JSONB,
  error_data JSONB,
  duration_ms INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_workflow_nodes_workflow_id ON workflow_nodes(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_connections_workflow_id ON workflow_connections(workflow_id);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_path ON webhook_endpoints(webhook_path);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_workflow_id ON webhook_endpoints(workflow_id);
CREATE INDEX IF NOT EXISTS idx_execution_contexts_execution_id ON execution_contexts(execution_id);
CREATE INDEX IF NOT EXISTS idx_workflow_variables_workflow_id ON workflow_variables(workflow_id);

-- Fonction pour nettoyer les anciens contextes d'exécution (éviter que la DB grossisse trop)
CREATE OR REPLACE FUNCTION cleanup_old_execution_contexts() RETURNS void AS $$
BEGIN
  DELETE FROM execution_contexts 
  WHERE started_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Trigger pour maintenir updated_at sur workflow_variables
CREATE OR REPLACE FUNCTION update_workflow_variables_timestamp() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workflow_variables_update_timestamp
  BEFORE UPDATE ON workflow_variables
  FOR EACH ROW EXECUTE FUNCTION update_workflow_variables_timestamp();