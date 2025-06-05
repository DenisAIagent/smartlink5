import React from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Form from '../../components/Form';
import useStore from '../../store/useStore';
import artistsService from '../../services/artists.service';
import ArtistStats from './components/ArtistStats';

const ArtistDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = React.useState(null);
  const [smartlinks, setSmartlinks] = React.useState([]);
  const [analytics, setAnalytics] = React.useState(null);
  const [period, setPeriod] = React.useState('7d');
  const [isLoading, setIsLoading] = React.useState(true);
  const addNotification = useStore((state) => state.addNotification);

  React.useEffect(() => {
    loadArtistData();
  }, [id, period]);

  const loadArtistData = async () => {
    setIsLoading(true);
    try {
      const [artistData, smartlinksData, analyticsData] = await Promise.all([
        artistsService.getById(id),
        artistsService.getSmartlinks(id),
        artistsService.getAnalytics(id, period),
      ]);
      setArtist(artistData);
      setSmartlinks(smartlinksData);
      setAnalytics(analyticsData);
    } catch (error) {
      addNotification({
        id: Date.now(),
        type: 'error',
        message: 'Erreur lors du chargement des données',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet artiste ?')) {
      try {
        await artistsService.delete(id);
        addNotification({
          id: Date.now(),
          type: 'success',
          message: 'Artiste supprimé avec succès',
        });
        navigate('/admin/artists');
      } catch (error) {
        addNotification({
          id: Date.now(),
          type: 'error',
          message: 'Erreur lors de la suppression',
        });
      }
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
        <div className="flex items-center space-x-4">
          <img
            src={artist.image}
            alt={artist.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold text-white">{artist.name}</h1>
            <p className="text-gray-400">{artist.genre}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Form.Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            options={[
              { value: '24h', label: '24 heures' },
              { value: '7d', label: '7 jours' },
              { value: '30d', label: '30 jours' },
              { value: '90d', label: '90 jours' },
            ]}
            className="w-40"
          />
          <Button
            variant="ghost"
            onClick={() => navigate(`/admin/artists/${id}/edit`)}
          >
            Modifier
          </Button>
          <Button
            variant="ghost"
            onClick={handleDelete}
          >
            Supprimer
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <ArtistStats
        analytics={analytics}
        period={period}
        onPeriodChange={setPeriod}
      />

      {/* SmartLinks */}
      <Card title="SmartLinks">
        <div className="space-y-4">
          {smartlinks.map((smartlink) => (
            <div
              key={smartlink.id}
              className="flex items-center justify-between p-4 bg-[#2A2A2E] rounded-lg"
            >
              <div>
                <h4 className="font-medium text-white">{smartlink.title}</h4>
                <p className="text-sm text-gray-400">{smartlink.clicks} clics</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/admin/smartlinks/${smartlink.id}`)}
                >
                  Voir les détails
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(smartlink.url, '_blank')}
                >
                  Ouvrir
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Liens et réseaux sociaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Plateformes de streaming">
          <div className="space-y-4">
            {Object.entries(artist.platforms).map(([platform, url]) => (
              url && (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 bg-[#2A2A2E] rounded-lg hover:bg-[#323236] transition-colors"
                >
                  <img
                    src={`/assets/images/${platform}-icon.svg`}
                    alt={platform}
                    className="w-6 h-6"
                  />
                  <span className="text-white capitalize">{platform}</span>
                </a>
              )
            ))}
          </div>
        </Card>

        <Card title="Réseaux sociaux">
          <div className="space-y-4">
            {Object.entries(artist.socialMedia).map(([platform, url]) => (
              url && (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 bg-[#2A2A2E] rounded-lg hover:bg-[#323236] transition-colors"
                >
                  <img
                    src={`/assets/images/${platform}-icon.svg`}
                    alt={platform}
                    className="w-6 h-6"
                  />
                  <span className="text-white capitalize">{platform}</span>
                </a>
              )
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ArtistDetailPage; 