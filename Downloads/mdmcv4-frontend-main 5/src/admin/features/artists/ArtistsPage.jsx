import React from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Form from '../../components/Form';
import useStore from '../../store/useStore';
import ArtistForm from './ArtistForm';

const ArtistsPage = () => {
  const [isCreating, setIsCreating] = React.useState(false);
  const [selectedArtist, setSelectedArtist] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedPlatform, setSelectedPlatform] = React.useState('all');
  const artists = useStore((state) => state.artists);
  const addNotification = useStore((state) => state.addNotification);

  const platforms = [
    { value: 'all', label: 'Toutes les plateformes' },
    { value: 'spotify', label: 'Spotify' },
    { value: 'apple', label: 'Apple Music' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'deezer', label: 'Deezer' },
  ];

  const filteredArtists = artists.filter(artist => {
    const matchesSearch = artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         artist.genre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = selectedPlatform === 'all' || artist.platforms.includes(selectedPlatform);
    return matchesSearch && matchesPlatform;
  });

  const handleCreateArtist = () => {
    setIsCreating(true);
    setSelectedArtist(null);
  };

  const handleEditArtist = (artist) => {
    setSelectedArtist(artist);
    setIsCreating(true);
  };

  const handleDeleteArtist = async (id) => {
    try {
      // Appel API pour supprimer l'artiste
      addNotification({
        id: Date.now(),
        type: 'success',
        message: 'Artiste supprimé avec succès',
      });
    } catch (error) {
      addNotification({
        id: Date.now(),
        type: 'error',
        message: 'Erreur lors de la suppression de l\'artiste',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Artistes</h1>
          <p className="text-gray-400">Gérez votre catalogue d'artistes</p>
        </div>
        <Button
          onClick={handleCreateArtist}
          variant="primary"
          size="lg"
        >
          Ajouter un artiste
        </Button>
      </div>

      {/* Filtres */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Input
          placeholder="Rechercher un artiste..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Form.Select
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          options={platforms}
        />
      </div>

      {/* Liste des artistes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArtists.map((artist) => (
          <Card
            key={artist.id}
            title={artist.name}
            subtitle={artist.genre}
            variant="elevated"
            onClick={() => handleEditArtist(artist)}
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {artist.platforms.map((platform) => (
                  <img
                    key={platform}
                    src={`/assets/images/${platform}-icon.svg`}
                    alt={platform}
                    className="w-6 h-6"
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>{artist.smartlinks.length} SmartLinks</span>
                <span>{artist.followers.toLocaleString()} followers</span>
              </div>
              <div className="flex items-center justify-end space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditArtist(artist);
                  }}
                >
                  Modifier
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteArtist(artist.id);
                  }}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal de création/édition */}
      {isCreating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#232326] rounded-xl shadow-xl w-full max-w-2xl"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                {selectedArtist ? 'Modifier l\'artiste' : 'Ajouter un artiste'}
              </h2>
              <ArtistForm
                artist={selectedArtist}
                onCancel={() => setIsCreating(false)}
                onSubmit={(data) => {
                  // Gérer la soumission
                  setIsCreating(false);
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ArtistsPage; 