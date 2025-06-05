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
  FormControlLabel,
  Switch
} from "@mui/material";
import { settingsService } from '../../services';
import { useNotificationStore } from '../../store';
import Form from '../../components/Form';

const SettingsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [generalSettings, setGeneralSettings] = useState({});
  const [interfaceSettings, setInterfaceSettings] = useState({});
  const [notificationSettings, setNotificationSettings] = useState({});
  const [themes, setThemes] = useState([]);
  const { showNotification } = useNotificationStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [
        generalData,
        interfaceData,
        notificationData,
        themesData,
      ] = await Promise.all([
        settingsService.getGeneralSettings(),
        settingsService.getInterfaceSettings(),
        settingsService.getNotificationSettings(),
        settingsService.getThemes(),
      ]);
      setGeneralSettings(generalData);
      setInterfaceSettings(interfaceData);
      setNotificationSettings(notificationData);
      setThemes(themesData);
    } catch (error) {
      showNotification('Erreur lors du chargement des paramètres', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateGeneralSettings = async (formData) => {
    try {
      await settingsService.updateGeneralSettings(formData);
      setGeneralSettings(formData);
      showNotification('Paramètres généraux mis à jour avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de la mise à jour des paramètres généraux', 'error');
    }
  };

  const handleUpdateInterfaceSettings = async (formData) => {
    try {
      await settingsService.updateInterfaceSettings(formData);
      setInterfaceSettings(formData);
      showNotification('Paramètres d\'interface mis à jour avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de la mise à jour des paramètres d\'interface', 'error');
    }
  };

  const handleUpdateNotificationSettings = async (formData) => {
    try {
      await settingsService.updateNotificationSettings(formData);
      setNotificationSettings(formData);
      showNotification('Paramètres de notification mis à jour avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de la mise à jour des paramètres de notification', 'error');
    }
  };

  const handleUpdateTheme = async (theme) => {
    try {
      await settingsService.updateTheme(theme);
      showNotification('Thème mis à jour avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de la mise à jour du thème', 'error');
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
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-gray-600">Configurez les paramètres de l'application</p>
      </div>

      {/* Settings Tabs */}
      <motion.div variants={itemVariants}>
        <Card>
          <Tabs
            tabs={[
              {
                label: 'Général',
                content: (
                  <Form onSubmit={handleUpdateGeneralSettings} initialValues={generalSettings}>
                    <div className="space-y-4">
                      <Form.Input
                        name="companyName"
                        label="Nom de l'entreprise"
                        required
                      />
                      <Form.Input
                        name="timezone"
                        label="Fuseau horaire"
                        required
                      />
                      <Form.Input
                        name="dateFormat"
                        label="Format de date"
                        required
                      />
                      <div className="flex justify-end">
                        <Button type="submit" variant="primary">
                          Enregistrer
                        </Button>
                      </div>
                    </div>
                  </Form>
                ),
              },
              {
                label: 'Interface',
                content: (
                  <div className="space-y-6">
                    <Form onSubmit={handleUpdateInterfaceSettings} initialValues={interfaceSettings}>
                      <div className="space-y-4">
                        <Form.Select
                          name="theme"
                          label="Thème"
                          options={themes.map((theme) => ({
                            value: theme.id,
                            label: theme.name,
                          }))}
                          required
                        />
                        <Form.Select
                          name="language"
                          label="Langue"
                          options={[
                            { value: 'fr', label: 'Français' },
                            { value: 'en', label: 'Anglais' },
                          ]}
                          required
                        />
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Mode sombre</label>
                          <Switch
                            name="darkMode"
                            checked={interfaceSettings.darkMode}
                            onChange={(checked) =>
                              handleUpdateInterfaceSettings({
                                ...interfaceSettings,
                                darkMode: checked,
                              })
                            }
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button type="submit" variant="primary">
                            Enregistrer
                          </Button>
                        </div>
                      </div>
                    </Form>
                  </div>
                ),
              },
              {
                label: 'Notifications',
                content: (
                  <Form onSubmit={handleUpdateNotificationSettings} initialValues={notificationSettings}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Notifications par email</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm">Nouvelles campagnes</label>
                            <Switch
                              name="emailNotifications.newCampaigns"
                              checked={notificationSettings.emailNotifications?.newCampaigns}
                              onChange={(checked) =>
                                handleUpdateNotificationSettings({
                                  ...notificationSettings,
                                  emailNotifications: {
                                    ...notificationSettings.emailNotifications,
                                    newCampaigns: checked,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <label className="text-sm">Rapports hebdomadaires</label>
                            <Switch
                              name="emailNotifications.weeklyReports"
                              checked={notificationSettings.emailNotifications?.weeklyReports}
                              onChange={(checked) =>
                                handleUpdateNotificationSettings({
                                  ...notificationSettings,
                                  emailNotifications: {
                                    ...notificationSettings.emailNotifications,
                                    weeklyReports: checked,
                                  },
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Notifications in-app</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm">Alertes système</label>
                            <Switch
                              name="inAppNotifications.systemAlerts"
                              checked={notificationSettings.inAppNotifications?.systemAlerts}
                              onChange={(checked) =>
                                handleUpdateNotificationSettings({
                                  ...notificationSettings,
                                  inAppNotifications: {
                                    ...notificationSettings.inAppNotifications,
                                    systemAlerts: checked,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <label className="text-sm">Mises à jour de campagne</label>
                            <Switch
                              name="inAppNotifications.campaignUpdates"
                              checked={notificationSettings.inAppNotifications?.campaignUpdates}
                              onChange={(checked) =>
                                handleUpdateNotificationSettings({
                                  ...notificationSettings,
                                  inAppNotifications: {
                                    ...notificationSettings.inAppNotifications,
                                    campaignUpdates: checked,
                                  },
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" variant="primary">
                          Enregistrer
                        </Button>
                      </div>
                    </div>
                  </Form>
                ),
              },
            ]}
          />
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default SettingsPage; 