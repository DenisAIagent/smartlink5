import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Form from '../../components/Form';
import Button from '../../components/Button';
import useStore from '../../store/useStore';

const schema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  genre: z.string().min(1, 'Le genre est requis'),
  bio: z.string().optional(),
  platforms: z.object({
    spotify: z.string().url('URL Spotify invalide').optional(),
    apple: z.string().url('URL Apple Music invalide').optional(),
    youtube: z.string().url('URL YouTube invalide').optional(),
    deezer: z.string().url('URL Deezer invalide').optional(),
  }),
  socialMedia: z.object({
    instagram: z.string().url('URL Instagram invalide').optional(),
    twitter: z.string().url('URL Twitter invalide').optional(),
    facebook: z.string().url('URL Facebook invalide').optional(),
    tiktok: z.string().url('URL TikTok invalide').optional(),
  }),
  image: z.string().url('URL de l\'image invalide').optional(),
});

const ArtistForm = ({ artist, onSubmit, onCancel }) => {
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
    defaultValues: artist || {
      name: '',
      genre: '',
      bio: '',
      platforms: {
        spotify: '',
        apple: '',
        youtube: '',
        deezer: '',
      },
      socialMedia: {
        instagram: '',
        twitter: '',
        facebook: '',
        tiktok: '',
      },
      image: '',
    },
  });

  const detectFromSpotify = async (url) => {
    setIsLoading(true);
    try {
      // Appel à l'API Spotify
      const response = await fetch(`/api/spotify/artist?url=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (data.success) {
        setDetectedData(data);
        setValue('name', data.name);
        setValue('genre', data.genres[0]);
        setValue('bio', data.bio);
        setValue('image', data.image);
        addNotification({
          id: Date.now(),
          type: 'success',
          message: 'Données artiste détectées avec succès',
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      addNotification({
        id: Date.now(),
        type: 'error',
        message: 'Erreur lors de la détection des données',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpotifyUrlChange = (e) => {
    const url = e.target.value;
    if (url && url.includes('spotify.com/artist/')) {
      detectFromSpotify(url);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <Form.Input
          label="URL Spotify"
          placeholder="Collez l'URL du profil Spotify"
          error={errors.platforms?.spotify?.message}
          {...register('platforms.spotify')}
          onChange={handleSpotifyUrlChange}
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
          label="Nom de l'artiste"
          placeholder="Nom de l'artiste"
          error={errors.name?.message}
          {...register('name')}
        />

        <Form.Input
          label="Genre"
          placeholder="Genre musical"
          error={errors.genre?.message}
          {...register('genre')}
        />

        <Form.Textarea
          label="Biographie"
          placeholder="Biographie de l'artiste"
          error={errors.bio?.message}
          {...register('bio')}
        />

        <div className="border-t border-[#2A2A2E] pt-4">
          <h3 className="text-lg font-semibold text-white mb-4">
            Plateformes de streaming
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Input
              label="Apple Music"
              placeholder="URL Apple Music"
              error={errors.platforms?.apple?.message}
              {...register('platforms.apple')}
            />
            <Form.Input
              label="YouTube"
              placeholder="URL YouTube"
              error={errors.platforms?.youtube?.message}
              {...register('platforms.youtube')}
            />
            <Form.Input
              label="Deezer"
              placeholder="URL Deezer"
              error={errors.platforms?.deezer?.message}
              {...register('platforms.deezer')}
            />
          </div>
        </div>

        <div className="border-t border-[#2A2A2E] pt-4">
          <h3 className="text-lg font-semibold text-white mb-4">
            Réseaux sociaux
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Input
              label="Instagram"
              placeholder="URL Instagram"
              error={errors.socialMedia?.instagram?.message}
              {...register('socialMedia.instagram')}
            />
            <Form.Input
              label="Twitter"
              placeholder="URL Twitter"
              error={errors.socialMedia?.twitter?.message}
              {...register('socialMedia.twitter')}
            />
            <Form.Input
              label="Facebook"
              placeholder="URL Facebook"
              error={errors.socialMedia?.facebook?.message}
              {...register('socialMedia.facebook')}
            />
            <Form.Input
              label="TikTok"
              placeholder="URL TikTok"
              error={errors.socialMedia?.tiktok?.message}
              {...register('socialMedia.tiktok')}
            />
          </div>
        </div>

        <Form.Input
          label="Image de profil"
          placeholder="URL de l'image"
          error={errors.image?.message}
          {...register('image')}
        />
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
          {artist ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  );
};

export default ArtistForm; 