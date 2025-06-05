import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ArtistForm from './ArtistForm';
import useStore from '../../store/useStore';
import artistsService from '../../services/artists.service';

const ArtistCreatePage = () => {
  const navigate = useNavigate();
  const addNotification = useStore((state) => state.addNotification);

  const handleSubmit = async (data) => {
    try {
      const newArtist = await artistsService.create(data);
      addNotification({
        id: Date.now(),
        type: 'success',
        message: 'Artiste créé avec succès',
      });
      navigate(`/admin/artists/${newArtist.id}`);
    } catch (error) {
      addNotification({
        id: Date.now(),
        type: 'error',
        message: 'Erreur lors de la création de l\'artiste',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Nouvel artiste</h1>
          <p className="text-gray-400">Ajoutez un nouvel artiste à votre catalogue</p>
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/artists')}
        >
          Annuler
        </Button>
      </div>

      {/* Formulaire */}
      <Card>
        <ArtistForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/admin/artists')}
        />
      </Card>
    </div>
  );
};

export default ArtistCreatePage; 