import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../../components/Card';
import CampaignForm from './CampaignForm';
import useStore from '../../store/useStore';
import campaignsService from '../../services/campaigns.service';

const CampaignCreatePage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const addNotification = useStore((state) => state.addNotification);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const campaign = await campaignsService.create(data);
      addNotification({
        id: Date.now(),
        type: 'success',
        message: 'Campagne créée avec succès',
      });
      navigate(`/admin/campaigns/${campaign.id}`);
    } catch (error) {
      addNotification({
        id: Date.now(),
        type: 'error',
        message: 'Erreur lors de la création de la campagne',
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-white">Nouvelle campagne</h1>
        <p className="text-gray-400">
          Créez une nouvelle campagne marketing en remplissant le formulaire ci-dessous
        </p>
      </motion.div>

      {/* Formulaire */}
      <motion.div variants={itemVariants}>
        <Card>
          <CampaignForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default CampaignCreatePage; 