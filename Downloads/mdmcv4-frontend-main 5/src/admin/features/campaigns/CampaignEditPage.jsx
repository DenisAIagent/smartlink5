import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../../components/Card';
import CampaignForm from './CampaignForm';
import useStore from '../../store/useStore';
import campaignsService from '../../services/campaigns.service';

const CampaignEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [campaign, setCampaign] = React.useState(null);
  const addNotification = useStore((state) => state.addNotification);

  React.useEffect(() => {
    loadCampaign();
  }, [id]);

  const loadCampaign = async () => {
    setIsLoading(true);
    try {
      const data = await campaignsService.getById(id);
      setCampaign(data);
    } catch (error) {
      addNotification({
        id: Date.now(),
        type: 'error',
        message: 'Erreur lors du chargement de la campagne',
      });
      navigate('/admin/campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await campaignsService.update(id, data);
      addNotification({
        id: Date.now(),
        type: 'success',
        message: 'Campagne mise à jour avec succès',
      });
      navigate(`/admin/campaigns/${id}`);
    } catch (error) {
      addNotification({
        id: Date.now(),
        type: 'error',
        message: 'Erreur lors de la mise à jour de la campagne',
      });
    } finally {
      setIsSubmitting(false);
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
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-white">Modifier la campagne</h1>
        <p className="text-gray-400">
          Modifiez les informations de la campagne ci-dessous
        </p>
      </motion.div>

      {/* Formulaire */}
      <motion.div variants={itemVariants}>
        <Card>
          <CampaignForm
            campaign={campaign}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default CampaignEditPage; 