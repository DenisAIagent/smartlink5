import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../../components/Card';
import Button from '../../components/Button';
import useStore from '../../store/useStore';
import campaignsService from '../../services/campaigns.service';
import { LineChart, BarChart, PieChart } from '../../components/Charts';

const CampaignDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);
  const [campaign, setCampaign] = React.useState(null);
  const [stats, setStats] = React.useState(null);
  const [smartlinks, setSmartlinks] = React.useState([]);
  const [period, setPeriod] = React.useState('7d');
  const addNotification = useStore((state) => state.addNotification);

  React.useEffect(() => {
    loadCampaignData();
  }, [id, period]);

  const loadCampaignData = async () => {
    setIsLoading(true);
    try {
      const [campaignData, statsData, smartlinksData] = await Promise.all([
        campaignsService.getById(id),
        campaignsService.getStats(id, period),
        campaignsService.getSmartlinks(id),
      ]);
      setCampaign(campaignData);
      setStats(statsData);
      setSmartlinks(smartlinksData);
    } catch (error) {
      addNotification({
        id: Date.now(),
        type: 'error',
        message: 'Erreur lors du chargement des données de la campagne',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await campaignsService.updateStatus(id, newStatus);
      setCampaign({ ...campaign, status: newStatus });
      addNotification({
        id: Date.now(),
        type: 'success',
        message: 'Statut de la campagne mis à jour',
      });
    } catch (error) {
      addNotification({
        id: Date.now(),
        type: 'error',
        message: 'Erreur lors de la mise à jour du statut',
      });
    }
  };

  const handleExport = async (format) => {
    try {
      await campaignsService.exportData(id, format);
    } catch (error) {
      addNotification({
        id: Date.now(),
        type: 'error',
        message: 'Erreur lors de l\'export des données',
      });
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E74C3C]" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Campagne non trouvée</h2>
        <Button
          variant="primary"
          onClick={() => navigate('/admin/campaigns')}
        >
          Retour à la liste
        </Button>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{campaign.name}</h1>
          <p className="text-gray-400">{campaign.description}</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="secondary"
            onClick={() => navigate(`/admin/campaigns/${id}/edit`)}
          >
            Modifier
          </Button>
          <Button
            variant="primary"
            onClick={() => handleExport('csv')}
          >
            Exporter
          </Button>
        </div>
      </div>

      {/* Informations principales */}
      <Card>
        <div className="grid grid-cols-4 gap-6">
          <motion.div variants={itemVariants}>
            <p className="text-sm text-gray-400">Statut</p>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                campaign.status === 'active' ? 'bg-green-500' :
                campaign.status === 'paused' ? 'bg-yellow-500' :
                campaign.status === 'completed' ? 'bg-blue-500' :
                'bg-gray-500'
              }`} />
              <span className="text-white capitalize">{campaign.status}</span>
            </div>
          </motion.div>
          <motion.div variants={itemVariants}>
            <p className="text-sm text-gray-400">Budget</p>
            <p className="text-white">{campaign.budget}€</p>
          </motion.div>
          <motion.div variants={itemVariants}>
            <p className="text-sm text-gray-400">Date de début</p>
            <p className="text-white">{new Date(campaign.startDate).toLocaleDateString()}</p>
          </motion.div>
          <motion.div variants={itemVariants}>
            <p className="text-sm text-gray-400">Date de fin</p>
            <p className="text-white">{new Date(campaign.endDate).toLocaleDateString()}</p>
          </motion.div>
        </div>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-6">
        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Clics</h3>
            <p className="text-3xl font-bold text-white">{stats.clicks}</p>
            <p className="text-sm text-gray-400">
              {stats.clicksChange > 0 ? '+' : ''}{stats.clicksChange}% vs période précédente
            </p>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Conversion</h3>
            <p className="text-3xl font-bold text-white">{stats.conversionRate}%</p>
            <p className="text-sm text-gray-400">
              {stats.conversionChange > 0 ? '+' : ''}{stats.conversionChange}% vs période précédente
            </p>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Budget utilisé</h3>
            <p className="text-3xl font-bold text-white">{stats.budgetUsed}€</p>
            <p className="text-sm text-gray-400">
              {((stats.budgetUsed / campaign.budget) * 100).toFixed(1)}% du budget total
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Évolution des clics</h3>
            <LineChart
              data={stats.clicksEvolution}
              xField="date"
              yField="clicks"
            />
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Distribution par plateforme</h3>
            <PieChart
              data={stats.platformDistribution}
              nameField="platform"
              valueField="clicks"
            />
          </Card>
        </motion.div>
      </div>

      {/* SmartLinks */}
      <Card title="SmartLinks associés">
        <div className="space-y-4">
          {smartlinks.map((smartlink) => (
            <motion.div
              key={smartlink.id}
              variants={itemVariants}
              className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
            >
              <div>
                <h4 className="text-white font-bold">{smartlink.name}</h4>
                <p className="text-sm text-gray-400">{smartlink.url}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div>
                  <p className="text-sm text-gray-400">Clics</p>
                  <p className="text-white font-bold">{smartlink.clicks}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Conversion</p>
                  <p className="text-white font-bold">{smartlink.conversionRate}%</p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/admin/smartlinks/${smartlink.id}`)}
                >
                  Détails
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Audience cible */}
      <Card title="Audience cible">
        <div className="grid grid-cols-3 gap-6">
          <motion.div variants={itemVariants}>
            <h4 className="text-white font-bold mb-2">Âge</h4>
            <p className="text-gray-400">
              {campaign.targetAudience.ageRange.min} - {campaign.targetAudience.ageRange.max} ans
            </p>
          </motion.div>
          <motion.div variants={itemVariants}>
            <h4 className="text-white font-bold mb-2">Localisations</h4>
            <div className="flex flex-wrap gap-2">
              {campaign.targetAudience.locations.map((location) => (
                <span
                  key={location}
                  className="px-2 py-1 bg-gray-700 rounded text-sm text-white"
                >
                  {location}
                </span>
              ))}
            </div>
          </motion.div>
          <motion.div variants={itemVariants}>
            <h4 className="text-white font-bold mb-2">Centres d'intérêt</h4>
            <div className="flex flex-wrap gap-2">
              {campaign.targetAudience.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-2 py-1 bg-gray-700 rounded text-sm text-white"
                >
                  {interest}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};

export default CampaignDetailPage; 