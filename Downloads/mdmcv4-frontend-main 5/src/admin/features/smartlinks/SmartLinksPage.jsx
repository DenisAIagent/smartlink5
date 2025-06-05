import React from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Form from '../../components/Form';
import useStore from '../../store/useStore';

const SmartLinksPage = () => {
  const [isCreating, setIsCreating] = React.useState(false);
  const [selectedSmartlink, setSelectedSmartlink] = React.useState(null);
  const smartlinks = useStore((state) => state.smartlinks);
  const addNotification = useStore((state) => state.addNotification);

  const handleCreateSmartlink = () => {
    setIsCreating(true);
    setSelectedSmartlink(null);
  };

  const handleEditSmartlink = (smartlink) => {
    setSelectedSmartlink(smartlink);
    setIsCreating(true);
  };

  const handleDeleteSmartlink = async (id) => {
    try {
      // Appel API pour supprimer le smartlink
      addNotification({
        id: Date.now(),
        type: 'success',
        message: 'SmartLink supprimé avec succès',
      });
    } catch (error) {
      addNotification({
        id: Date.now(),
        type: 'error',
        message: 'Erreur lors de la suppression du SmartLink',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">SmartLinks</h1>
          <p className="text-gray-400">Gérez vos liens intelligents</p>
        </div>
        <Button
          onClick={handleCreateSmartlink}
          variant="primary"
          size="lg"
        >
          Créer un SmartLink
        </Button>
      </div>

      {/* Liste des SmartLinks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {smartlinks.map((smartlink) => (
          <Card
            key={smartlink.id}
            title={smartlink.title}
            subtitle={smartlink.artist}
            variant="elevated"
            onClick={() => handleEditSmartlink(smartlink)}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  {smartlink.platforms.length} plateformes
                </span>
                <span className="text-sm text-gray-400">
                  {smartlink.clicks} clics
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {smartlink.platforms.map((platform) => (
                  <img
                    key={platform}
                    src={`/assets/images/${platform}-icon.svg`}
                    alt={platform}
                    className="w-6 h-6"
                  />
                ))}
              </div>
              <div className="flex items-center justify-end space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditSmartlink(smartlink);
                  }}
                >
                  Modifier
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSmartlink(smartlink.id);
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
                {selectedSmartlink ? 'Modifier le SmartLink' : 'Créer un SmartLink'}
              </h2>
              <form className="space-y-4">
                <Form.Input
                  label="Titre"
                  placeholder="Entrez le titre"
                  defaultValue={selectedSmartlink?.title}
                />
                <Form.Input
                  label="Artiste"
                  placeholder="Entrez le nom de l'artiste"
                  defaultValue={selectedSmartlink?.artist}
                />
                <Form.Textarea
                  label="Description"
                  placeholder="Entrez une description"
                  defaultValue={selectedSmartlink?.description}
                />
                <div className="flex items-center justify-end space-x-3">
                  <Button
                    variant="ghost"
                    onClick={() => setIsCreating(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                  >
                    {selectedSmartlink ? 'Modifier' : 'Créer'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SmartLinksPage; 