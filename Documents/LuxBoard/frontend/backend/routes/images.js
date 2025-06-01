const express = require('express');
const router = express.Router();
const { imageService } = require('../services/imageService');
const { authenticate } = require('../middleware/auth');

// Route pour rechercher des images
router.get('/search', authenticate, async (req, res) => {
  try {
    const { 
      query = 'luxury', 
      page = 1, 
      perPage = 10, 
      source = 'unsplash' 
    } = req.query;

    const result = await imageService.searchPhotos(
      query, 
      parseInt(page), 
      parseInt(perPage), 
      source
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Images récupérées avec succès',
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Erreur lors de la recherche d\'images:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la recherche d\'images'
    });
  }
});

// Route pour obtenir une image aléatoire
router.get('/random', authenticate, async (req, res) => {
  try {
    const { query = 'luxury' } = req.query;

    const result = await imageService.getRandomPhoto(query);

    if (result.success) {
      res.json({
        success: true,
        message: 'Image aléatoire récupérée avec succès',
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération d\'image aléatoire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération d\'image aléatoire'
    });
  }
});

// Route pour obtenir des images par catégorie de luxe
router.get('/luxury/:category', authenticate, async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, perPage = 10 } = req.query;

    const result = await imageService.getLuxuryImages(
      category, 
      parseInt(page), 
      parseInt(perPage)
    );

    if (result.success) {
      res.json({
        success: true,
        message: `Images de luxe (${category}) récupérées avec succès`,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération d\'images de luxe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération d\'images de luxe'
    });
  }
});

// Route pour obtenir les catégories disponibles
router.get('/categories', authenticate, (req, res) => {
  const categories = [
    { id: 'luxury', name: 'Luxe Général', description: 'Images de luxe générales' },
    { id: 'restaurant', name: 'Restaurants', description: 'Restaurants gastronomiques' },
    { id: 'hotel', name: 'Hôtels', description: 'Hôtels de luxe' },
    { id: 'spa', name: 'Spa & Wellness', description: 'Spas et centres de bien-être' },
    { id: 'travel', name: 'Voyages', description: 'Destinations de luxe' },
    { id: 'fashion', name: 'Mode', description: 'Mode et boutiques de luxe' },
    { id: 'jewelry', name: 'Bijouterie', description: 'Bijoux et montres de luxe' },
    { id: 'car', name: 'Automobiles', description: 'Voitures de luxe' },
    { id: 'yacht', name: 'Yachts', description: 'Yachts et bateaux de luxe' },
    { id: 'wine', name: 'Vins & Champagnes', description: 'Vins et champagnes de prestige' }
  ];

  res.json({
    success: true,
    message: 'Catégories récupérées avec succès',
    data: categories
  });
});

module.exports = router;

