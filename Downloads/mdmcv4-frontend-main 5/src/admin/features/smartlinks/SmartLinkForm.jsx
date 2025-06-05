import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Form from '../../components/Form';
import Button from '../../components/Button';
import useStore from '../../store/useStore';

const schema = z.object({
  url: z.string().url('URL invalide'),
  title: z.string().min(1, 'Le titre est requis'),
  artist: z.string().min(1, "Le nom de l'artiste est requis"),
  description: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

const SmartLinkForm = ({ smartlink, onSubmit, onCancel }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [detectedData, setDetectedData] = React.useState(null);
  const addNotification = useStore((state) => state.addNotification);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: smartlink || {
      url: '',
      title: '',
      artist: '',
      description: '',
      utmSource: '',
      utmMedium: '',
      utmCampaign: '',
    },
  });

  const detectFromUrl = async (url) => {
    setIsLoading(true);
    try {
      // Appel à l'API Odesli
      const response = await fetch(`/api/odesli?url=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (data.success) {
        setDetectedData(data);
        setValue('title', data.title);
        setValue('artist', data.artist);
        addNotification({
          id: Date.now(),
          type: 'success',
          message: 'Données détectées avec succès',
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      addNotification({
        id: Date.now(),
        type: 'error',
        message: "Erreur lors de la détection des données",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    if (url && url.match(/^(spotify|apple|youtube|deezer|tidal)/)) {
      detectFromUrl(url);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <Form.Input
          label="URL de la musique"
          placeholder="Collez l'URL Spotify, Apple Music, etc."
          error={errors.url?.message}
          {...register('url')}
          onChange={handleUrlChange}
        />

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-4"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E74C3C]" />
          </motion.div>
        )}

        <Form.Input
          label="Titre"
          placeholder="Titre de la musique"
          error={errors.title?.message}
          {...register('title')}
        />

        <Form.Input
          label="Artiste"
          placeholder="Nom de l'artiste"
          error={errors.artist?.message}
          {...register('artist')}
        />

        <Form.Textarea
          label="Description"
          placeholder="Description (optionnelle)"
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="border-t border-[#2A2A2E] pt-4">
          <h3 className="text-lg font-semibold text-white mb-4">
            Paramètres UTM
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Input
              label="Source"
              placeholder="utm_source"
              error={errors.utmSource?.message}
              {...register('utmSource')}
            />
            <Form.Input
              label="Medium"
              placeholder="utm_medium"
              error={errors.utmMedium?.message}
              {...register('utmMedium')}
            />
            <Form.Input
              label="Campaign"
              placeholder="utm_campaign"
              error={errors.utmCampaign?.message}
              {...register('utmCampaign')}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
        >
          {smartlink ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  );
};

export default SmartLinkForm; 