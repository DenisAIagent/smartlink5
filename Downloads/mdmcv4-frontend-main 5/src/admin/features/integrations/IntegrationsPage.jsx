import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  Button, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";
import { integrationsService } from '../../services';
import { useNotificationStore } from '../../store';
import Form from '../../components/Form';

const IntegrationsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [integrations, setIntegrations] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [webhooks, setWebhooks] = useState([]);
  const [syncStatus, setSyncStatus] = useState({});
  const [logs, setLogs] = useState([]);
  const { showNotification } = useNotificationStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await integrationsService.getIntegrations();
      setIntegrations(data);
    } catch (error) {
      showNotification('Erreur lors du chargement des intégrations', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = (platform) => {
    setSelectedPlatform(platform);
    setIsConnectModalOpen(true);
  };

  const handleDisconnect = async (platform) => {
    if (window.confirm(`Êtes-vous sûr de vouloir déconnecter ${platform} ?`)) {
      try {
        await integrationsService.disconnectIntegration(platform);
        loadData();
        showNotification(`${platform} déconnecté avec succès`, 'success');
      } catch (error) {
        showNotification(`Erreur lors de la déconnexion de ${platform}`, 'error');
      }
    }
  };

  const handleSubmitConnect = async (formData) => {
    try {
      await integrationsService.connectIntegration(selectedPlatform, formData);
      setIsConnectModalOpen(false);
      loadData();
      showNotification(`${selectedPlatform} connecté avec succès`, 'success');
    } catch (error) {
      showNotification(`Erreur lors de la connexion à ${selectedPlatform}`, 'error');
    }
  };

  const handleAddWebhook = (platform) => {
    setSelectedPlatform(platform);
    setIsWebhookModalOpen(true);
  };

  const handleSubmitWebhook = async (formData) => {
    try {
      await integrationsService.createWebhook(selectedPlatform, formData);
      setIsWebhookModalOpen(false);
      loadWebhooks(selectedPlatform);
      showNotification('Webhook créé avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de la création du webhook', 'error');
    }
  };

  const handleDeleteWebhook = async (platform, webhookId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce webhook ?')) {
      try {
        await integrationsService.deleteWebhook(platform, webhookId);
        loadWebhooks(platform);
        showNotification('Webhook supprimé avec succès', 'success');
      } catch (error) {
        showNotification('Erreur lors de la suppression du webhook', 'error');
      }
    }
  };

  const loadWebhooks = async (platform) => {
    try {
      const data = await integrationsService.getWebhooks(platform);
      setWebhooks(data);
    } catch (error) {
      showNotification('Erreur lors du chargement des webhooks', 'error');
    }
  };

  const handleSync = async (platform) => {
    try {
      await integrationsService.syncData(platform);
      showNotification('Synchronisation démarrée avec succès', 'success');
      loadSyncStatus(platform);
    } catch (error) {
      showNotification('Erreur lors du démarrage de la synchronisation', 'error');
    }
  };

  const loadSyncStatus = async (platform) => {
    try {
      const status = await integrationsService.getSyncStatus(platform);
      setSyncStatus(status);
    } catch (error) {
      showNotification('Erreur lors du chargement du statut de synchronisation', 'error');
    }
  };

  const loadLogs = async (platform) => {
    try {
      const data = await integrationsService.getLogs(platform);
      setLogs(data);
    } catch (error) {
      showNotification('Erreur lors du chargement des logs', 'error');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Intégrations</h1>
        <p className="text-gray-600">Gérez vos connexions avec les plateformes externes</p>
      </div>

      {/* Integrations List */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Plateformes disponibles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrations.map((integration) => (
                <Card key={integration.platform} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium">{integration.name}</h3>
                      <p className="text-sm text-gray-600">{integration.description}</p>
                    </div>
                    <img
                      src={integration.logo}
                      alt={integration.name}
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <div className="flex space-x-2">
                    {integration.connected ? (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => handleSync(integration.platform)}
                        >
                          Synchroniser
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDisconnect(integration.platform)}
                        >
                          Déconnecter
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={() => handleConnect(integration.platform)}
                      >
                        Connecter
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Platform Details */}
      {selectedPlatform && (
        <motion.div variants={itemVariants}>
          <Card>
            <div className="p-6">
              <Tabs
                tabs={[
                  {
                    label: 'Webhooks',
                    content: (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium">Webhooks</h3>
                          <Button
                            variant="primary"
                            onClick={() => handleAddWebhook(selectedPlatform)}
                          >
                            Ajouter un webhook
                          </Button>
                        </div>
                        <Table
                          columns={[
                            { header: 'URL', accessor: 'url' },
                            { header: 'Événements', accessor: 'events' },
                            { header: 'Statut', accessor: 'status' },
                            {
                              header: 'Actions',
                              accessor: 'actions',
                              cell: (row) => (
                                <Button
                                  variant="danger"
                                  onClick={() =>
                                    handleDeleteWebhook(selectedPlatform, row.id)
                                  }
                                >
                                  Supprimer
                                </Button>
                              ),
                            },
                          ]}
                          data={webhooks}
                        />
                      </div>
                    ),
                  },
                  {
                    label: 'Synchronisation',
                    content: (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium">Statut de synchronisation</h3>
                          <Button
                            variant="primary"
                            onClick={() => handleSync(selectedPlatform)}
                          >
                            Synchroniser maintenant
                          </Button>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p>Dernière synchronisation : {syncStatus.lastSync}</p>
                          <p>Statut : {syncStatus.status}</p>
                          <p>Progression : {syncStatus.progress}%</p>
                        </div>
                      </div>
                    ),
                  },
                  {
                    label: 'Logs',
                    content: (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Logs d'activité</h3>
                        <Table
                          columns={[
                            { header: 'Date', accessor: 'date' },
                            { header: 'Type', accessor: 'type' },
                            { header: 'Message', accessor: 'message' },
                            { header: 'Statut', accessor: 'status' },
                          ]}
                          data={logs}
                        />
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </Card>
        </motion.div>
      )}

      {/* Connect Modal */}
      <Dialog
        open={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Connecter " + selectedPlatform}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="apiKey"
            label="Clé API"
            type="text"
            fullWidth
            required
          />
          <TextField
            margin="dense"
            id="apiSecret"
            label="Secret API"
            type="password"
            fullWidth
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsConnectModalOpen(false)} color="primary">
            Annuler
          </Button>
          <Button onClick={handleSubmitConnect} color="primary" autoFocus>
            Connecter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Webhook Modal */}
      <Dialog
        open={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Ajouter un webhook"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="url"
            label="URL du webhook"
            type="text"
            fullWidth
            required
          />
          <TextField
            margin="dense"
            id="events"
            label="Événements"
            type="text"
            fullWidth
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsWebhookModalOpen(false)} color="primary">
            Annuler
          </Button>
          <Button onClick={handleSubmitWebhook} color="primary" autoFocus>
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default IntegrationsPage; 