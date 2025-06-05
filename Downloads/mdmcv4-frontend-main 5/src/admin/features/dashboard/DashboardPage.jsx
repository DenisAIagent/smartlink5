import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Button, Form } from '../../components';
import { dashboardService } from '../../services';
import { useNotificationStore } from '../../stores';

const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const { showNotification } = useNotificationStore();

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsData, alertsData, activityData, performersData] = await Promise.all([
        dashboardService.getStats(selectedPeriod),
        dashboardService.getAlerts(),
        dashboardService.getRecentActivity(),
        dashboardService.getTopPerformers(selectedPeriod),
      ]);

      setStats(statsData);
      setAlerts(alertsData);
      setRecentActivity(activityData);
      setTopPerformers(performersData);
    } catch (error) {
      showNotification('Erreur lors du chargement des données', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await dashboardService.exportData(selectedPeriod);
      showNotification('Export réussi', 'success');
    } catch (error) {
      showNotification('Erreur lors de l\'export', 'error');
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Tableau de bord</h1>
          <p className="text-gray-600">Vue d'ensemble de vos performances</p>
        </div>
        <div className="flex items-center space-x-4">
          <Form.Select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            options={[
              { value: '24h', label: '24 heures' },
              { value: '7d', label: '7 jours' },
              { value: '30d', label: '30 jours' },
              { value: '90d', label: '90 jours' },
            ]}
          />
          <Button onClick={handleExport} variant="outline">
            Exporter
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg ${
                    alert.type === 'error'
                      ? 'bg-red-50 text-red-700'
                      : alert.type === 'warning'
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {alert.type === 'error' ? (
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : alert.type === 'warning' ? (
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{alert.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* KPIs */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats?.kpis.map((kpi) => (
          <Card key={kpi.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{kpi.label}</p>
                <p className="text-2xl font-semibold mt-1">{kpi.value}</p>
              </div>
              <div
                className={`flex items-center ${
                  kpi.change > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                <span className="text-sm font-medium">
                  {kpi.change > 0 ? '+' : ''}
                  {kpi.change}%
                </span>
                <svg
                  className={`w-4 h-4 ml-1 ${
                    kpi.change > 0 ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="text-lg font-medium mb-4">Évolution des clics</h3>
            <div className="h-80">
              {/* Intégrer un composant de graphique ici */}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="text-lg font-medium mb-4">Distribution par plateforme</h3>
            <div className="h-80">
              {/* Intégrer un composant de graphique ici */}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Top Performers */}
      <motion.div variants={itemVariants}>
        <Card>
          <h3 className="text-lg font-medium mb-4">Meilleurs artistes</h3>
          <div className="space-y-4">
            {topPerformers.map((artist) => (
              <div key={artist.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{artist.name}</p>
                    <p className="text-sm text-gray-600">{artist.genre}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{artist.clicks} clics</p>
                  <p className="text-sm text-gray-600">
                    {artist.conversionRate}% de conversion
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <Card>
          <h3 className="text-lg font-medium mb-4">Activité récente</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage; 