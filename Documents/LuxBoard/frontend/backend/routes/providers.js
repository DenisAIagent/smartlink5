const express = require('express');
const router = express.Router();

// Contrôleurs
const {
  getProviders,
  getProvider,
  createProvider,
  updateProvider,
  deleteProvider,
  validateProvider,
  getNearbyProviders
} = require('../controllers/providerController');

// Middlewares
const { authenticate, authorize, authorizeMinimumRole, optionalAuthenticate } = require('../middleware/auth');
const { validate, providerSchema, searchSchema } = require('../middleware/validation');

/**
 * @route   GET /api/providers
 * @desc    Obtenir tous les prestataires avec pagination et filtres
 * @access  Public (avec authentification optionnelle pour voir les statuts)
 */
router.get('/', optionalAuthenticate, validate(searchSchema, 'query'), getProviders);

/**
 * @route   GET /api/providers/nearby
 * @desc    Rechercher des prestataires à proximité
 * @access  Public
 */
router.get('/nearby', getNearbyProviders);

/**
 * @route   GET /api/providers/:id
 * @desc    Obtenir un prestataire par ID
 * @access  Public (avec authentification optionnelle pour voir les statuts)
 */
router.get('/:id', optionalAuthenticate, getProvider);

/**
 * @route   POST /api/providers
 * @desc    Créer un nouveau prestataire
 * @access  Private (tous les utilisateurs connectés)
 */
router.post('/', authenticate, validate(providerSchema), createProvider);

/**
 * @route   PUT /api/providers/:id
 * @desc    Mettre à jour un prestataire
 * @access  Private (propriétaire, éditeur ou admin)
 */
router.put('/:id', authenticate, validate(providerSchema), updateProvider);

/**
 * @route   DELETE /api/providers/:id
 * @desc    Supprimer un prestataire
 * @access  Private (propriétaire, éditeur ou admin)
 */
router.delete('/:id', authenticate, deleteProvider);

/**
 * @route   POST /api/providers/:id/validate
 * @desc    Valider un prestataire
 * @access  Private (éditeur ou admin seulement)
 */
router.post('/:id/validate', authenticate, authorizeMinimumRole('editor'), validateProvider);

module.exports = router;

