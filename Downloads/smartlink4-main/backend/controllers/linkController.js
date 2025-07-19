const { validationResult } = require('express-validator');
const linkService = require('../services/linkService');

const createLink = async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Validation errors:", errors.array());
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }
    
    const linkData = req.body;
    
    // Créer le lien
    const newLink = await linkService.createLink(linkData);
    
    res.status(201).json(newLink);
  } catch (error) {
    if (error.message === 'Slug already exists') {
      return res.status(409).json({
        error: 'Ce slug est déjà utilisé. Essayez un autre slug.'
      });
    }
    
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
};

const getAllLinks = async (req, res) => {
  try {
    const links = await linkService.getAllLinks();
    res.status(200).json(links);
  } catch (error) {
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
};

const getLinkBySlug = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Slug invalide',
        details: errors.array()
      });
    }
    
    const { slug } = req.params;
    const link = await linkService.getLinkBySlug(slug);
    
    if (!link) {
      return res.status(404).json({
        error: 'Lien non trouvé'
      });
    }
    
    // Incrémenter le compteur de vues
    await linkService.incrementView(slug);
    
    res.status(200).json(link);
  } catch (error) {
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
};

const redirectToPlatform = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Paramètres invalides',
        details: errors.array()
      });
    }
    
    const { slug, platform } = req.params;
    
    // Récupérer le lien
    const link = await linkService.getLinkBySlug(slug);
    
    if (!link) {
      return res.status(404).json({
        error: 'Lien non trouvé'
      });
    }
    
    // Récupérer l'URL de la plateforme
    const platformUrl = link.streamingLinks.get(platform);
    
    if (!platformUrl) {
      return res.status(404).json({
        error: 'Plateforme non disponible pour ce lien'
      });
    }
    
    // Incrémenter le compteur de clics
    await linkService.incrementClick(slug, platform);
    
    // Redirection 302
    res.redirect(302, platformUrl);
  } catch (error) {
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
};

const checkSlugAvailability = async (req, res) => {
  try {
    const { slug } = req.params;
    const isAvailable = await linkService.checkSlugAvailability(slug);
    
    res.status(200).json({
      available: isAvailable
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
};

module.exports = {
  createLink,
  getAllLinks,
  getLinkBySlug,
  redirectToPlatform,
  checkSlugAvailability
};

