import React from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ArtistForm from './ArtistForm';
import useStore from '../../store/useStore';
import artistsService from '../../services/artists.service';

const ArtistEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const addNotification = useStore((state) => state.addNotification);

  React.useEffect(() => {
    loadArtist();
  }, [id]);

  const loadArtist = async () => {
    setIsLoading(true);
    try {
      const data = await artistsService.getById(id);
      setArtist(data);
    } catch (error) {
      addNotification({
        id: Date.now(),
        type: 'error',
        message: 'Erreur lors du chargement de l\'artiste',
      });
      navigate('/admin/artists');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      await artistsService.update(id, data);
      addNotification({
        id: Date.now(),
        type: 'success',
        message: 'Artiste mis à jour avec succès',
      });
      navigate(`/admin/artists/${id}`);
    } catch (error) {
      addNotification({
        id: Date.now(),
        type: 'error',
        message: 'Erreur lors de la mise à jour de l\'artiste',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E74C3C]" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white">Artiste non trouvé</h2>
        <Button
          variant="primary"
          className="mt-4"
          onClick={() => navigate('/admin/artists')}
        >
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Modifier l'artiste</h1>
          <p className="text-gray-400">Mettez à jour les informations de {artist.name}</p>
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate(`/admin/artists/${id}`)}
        >
          Annuler
        </Button>
      </div>

      {/* Formulaire */}
      <Card>
        <ArtistForm
          artist={artist}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/admin/artists/${id}`)}
        />
      </Card>
    </div>
  );
};

export default ArtistEditPage; 