import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Form from '../../components/Form';
import useStore from '../../store/useStore';
import campaignsService from '../../services/campaigns.service';

const CampaignsPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);
  const [campaigns, setCampaigns] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const addNotification = useStore((state) => state.addNotification);

  React.useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      const data = await campaignsService.getAll();
      setCampaigns(data);
    } catch (error) {
      addNotification({
        id: Date.now(),
        type: 'error',
        message: 'Erreur lors du chargement des campagnes',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) {
      try {
        await campaignsService.delete(id);
        setCampaigns(campaigns.filter(campaign => campaign.id !== id));
        addNotification({
          id: Date.now(),
          type: 'success',
          message: 'Campagne supprimée avec succès',
        });
      } catch (error) {
        addNotification({
          id: Date.now(),
          type: 'error',
          message: 'Erreur lors de la suppression de la campagne',
        });
      }
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-2xl font-bold text-white">Campagnes</h1>
          <p className="text-gray-400">Gérez vos campagnes marketing</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/admin/campaigns/new')}
        >
          Nouvelle campagne
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex items-center space-x-4">
        <Form.Input
          type="text"
          placeholder="Rechercher une campagne..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64"
        />
        <Form.Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'all', label: 'Tous les statuts' },
            { value: 'draft', label: 'Brouillon' },
            { value: 'active', label: 'Active' },
            { value: 'paused', label: 'En pause' },
            { value: 'completed', label: 'Terminée' },
          ]}
          className="w-40"
        />
      </div>

      {/* Liste des campagnes */}
      <div className="grid grid-cols-1 gap-6">
        {filteredCampaigns.map((campaign) => (
          <motion.div key={campaign.id} variants={itemVariants}>
            <Card>
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{campaign.name}</h3>
                    <p className="text-gray-400">{campaign.description}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        campaign.status === 'active' ? 'bg-green-500' :
                        campaign.status === 'paused' ? 'bg-yellow-500' :
                        campaign.status === 'completed' ? 'bg-blue-500' :
                        'bg-gray-500'
                      }`} />
                      <span className="text-sm text-gray-400 capitalize">{campaign.status}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Clics</p>
                      <p className="text-xl font-bold text-white">{campaign.stats.clicks}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Conversion</p>
                      <p className="text-xl font-bold text-white">{campaign.stats.conversionRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Budget utilisé</p>
                      <p className="text-xl font-bold text-white">{campaign.stats.budgetUsed}€</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/admin/campaigns/${campaign.id}`)}
                  >
                    Détails
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/admin/campaigns/${campaign.id}/edit`)}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(campaign.id)}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default CampaignsPage; 