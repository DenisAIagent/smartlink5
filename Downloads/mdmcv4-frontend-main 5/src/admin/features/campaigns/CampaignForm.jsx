import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Form from '../../components/Form';
import useStore from '../../store/useStore';

const campaignSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  startDate: z.string().refine((date) => new Date(date) > new Date(), {
    message: 'La date de début doit être dans le futur',
  }),
  endDate: z.string(),
  budget: z.number().min(0, 'Le budget doit être positif'),
  status: z.enum(['draft', 'active', 'paused', 'completed']),
  targetAudience: z.object({
    ageRange: z.object({
      min: z.number().min(13, 'L\'âge minimum doit être de 13 ans'),
      max: z.number().max(100, 'L\'âge maximum doit être de 100 ans'),
    }),
    locations: z.array(z.string()).min(1, 'Sélectionnez au moins une localisation'),
    interests: z.array(z.string()).min(1, 'Sélectionnez au moins un centre d\'intérêt'),
  }),
  platforms: z.array(z.string()).min(1, 'Sélectionnez au moins une plateforme'),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: 'La date de fin doit être après la date de début',
  path: ['endDate'],
});

const CampaignForm = ({ campaign, onSubmit, isSubmitting }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(campaignSchema),
    defaultValues: campaign || {
      status: 'draft',
      targetAudience: {
        ageRange: { min: 18, max: 65 },
        locations: [],
        interests: [],
      },
      platforms: [],
    },
  });

  const addNotification = useStore((state) => state.addNotification);

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      addNotification({
        id: Date.now(),
        type: 'error',
        message: 'Erreur lors de la sauvegarde de la campagne',
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

  return (
    <motion.form
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6"
    >
      <Card>
        <div className="space-y-6">
          <motion.div variants={itemVariants}>
            <Form.Input
              label="Nom de la campagne"
              {...register('name')}
              error={errors.name?.message}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Form.Textarea
              label="Description"
              {...register('description')}
              error={errors.description?.message}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
            <Form.Input
              type="date"
              label="Date de début"
              {...register('startDate')}
              error={errors.startDate?.message}
            />
            <Form.Input
              type="date"
              label="Date de fin"
              {...register('endDate')}
              error={errors.endDate?.message}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Form.Input
              type="number"
              label="Budget (€)"
              {...register('budget', { valueAsNumber: true })}
              error={errors.budget?.message}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Form.Select
              label="Statut"
              {...register('status')}
              options={[
                { value: 'draft', label: 'Brouillon' },
                { value: 'active', label: 'Active' },
                { value: 'paused', label: 'En pause' },
                { value: 'completed', label: 'Terminée' },
              ]}
              error={errors.status?.message}
            />
          </motion.div>
        </div>
      </Card>

      <Card title="Audience cible">
        <div className="space-y-6">
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
            <Form.Input
              type="number"
              label="Âge minimum"
              {...register('targetAudience.ageRange.min', { valueAsNumber: true })}
              error={errors.targetAudience?.ageRange?.min?.message}
            />
            <Form.Input
              type="number"
              label="Âge maximum"
              {...register('targetAudience.ageRange.max', { valueAsNumber: true })}
              error={errors.targetAudience?.ageRange?.max?.message}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Form.MultiSelect
              label="Localisations"
              {...register('targetAudience.locations')}
              options={[
                { value: 'fr', label: 'France' },
                { value: 'be', label: 'Belgique' },
                { value: 'ch', label: 'Suisse' },
                { value: 'ca', label: 'Canada' },
              ]}
              error={errors.targetAudience?.locations?.message}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Form.MultiSelect
              label="Centres d'intérêt"
              {...register('targetAudience.interests')}
              options={[
                { value: 'pop', label: 'Pop' },
                { value: 'rock', label: 'Rock' },
                { value: 'hiphop', label: 'Hip-Hop' },
                { value: 'electronic', label: 'Électronique' },
                { value: 'jazz', label: 'Jazz' },
                { value: 'classical', label: 'Classique' },
              ]}
              error={errors.targetAudience?.interests?.message}
            />
          </motion.div>
        </div>
      </Card>

      <Card title="Plateformes">
        <motion.div variants={itemVariants}>
          <Form.MultiSelect
            label="Plateformes de streaming"
            {...register('platforms')}
            options={[
              { value: 'spotify', label: 'Spotify' },
              { value: 'applemusic', label: 'Apple Music' },
              { value: 'deezer', label: 'Deezer' },
              { value: 'youtube', label: 'YouTube Music' },
              { value: 'tidal', label: 'Tidal' },
            ]}
            error={errors.platforms?.message}
          />
        </motion.div>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              <span>Enregistrement...</span>
            </div>
          ) : (
            'Enregistrer'
          )}
        </Button>
      </div>
    </motion.form>
  );
};

export default CampaignForm; 