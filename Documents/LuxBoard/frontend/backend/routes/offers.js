const express = require('express');
const router = express.Router();

// Contrôleurs
const {
  getOffers,
  getOffer,
  createOffer,
  updateOffer,
  deleteOffer,
  useOffer,
  validateOffer,
  getExpiringSoonOffers
} = require('../controllers/offerController');

// Middlewares
const { authenticate, authorize, authorizeMinimumRole, optionalAuthenticate } = require('../middleware/auth');
const { validate, offerSchema, searchSchema } = require('../middleware/validation');

/**
 * @route   GET /api/offers
 * @desc    Obtenir toutes les offres avec pagination et filtres
 * @access  Public (avec authentification optionnelle pour voir les statuts)
 */
router.get('/', optionalAuthenticate, validate(searchSchema, 'query'), getOffers);

/**
 * @route   GET /api/offers/expiring-soon
 * @desc    Obtenir les offres qui expirent bientôt
 * @access  Private (éditeur ou admin seulement)
 */
router.get('/expiring-soon', authenticate, authorizeMinimumRole('editor'), getExpiringSoonOffers);

/**
 * @route   GET /api/offers/:id
 * @desc    Obtenir une offre par ID
 * @access  Public (avec authentification optionnelle pour voir les statuts)
 */
router.get('/:id', optionalAuthenticate, getOffer);

/**
 * @route   POST /api/offers
 * @desc    Créer une nouvelle offre
 * @access  Private (éditeur ou admin seulement)
 */
router.post('/', authenticate, authorizeMinimumRole('editor'), validate(offerSchema), createOffer);

/**
 * @route   PUT /api/offers/:id
 * @desc    Mettre à jour une offre
 * @access  Private (propriétaire, éditeur ou admin)
 */
router.put('/:id', authenticate, authorizeMinimumRole('editor'), validate(offerSchema), updateOffer);

/**
 * @route   DELETE /api/offers/:id
 * @desc    Supprimer une offre
 * @access  Private (propriétaire, éditeur ou admin)
 */
router.delete('/:id', authenticate, authorizeMinimumRole('editor'), deleteOffer);

/**
 * @route   POST /api/offers/:id/use
 * @desc    Utiliser une offre (incrémenter le compteur)
 * @access  Private (tous les utilisateurs connectés)
 */
router.post('/:id/use', authenticate, useOffer);

/**
 * @route   POST /api/offers/:id/validate
 * @desc    Valider une offre
 * @access  Private (éditeur ou admin seulement)
 */
router.post('/:id/validate', authenticate, authorizeMinimumRole('editor'), validateOffer);

module.exports = router;

