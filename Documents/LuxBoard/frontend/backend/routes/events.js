const express = require('express');
const router = express.Router();

// Contrôleurs
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  validateEvent,
  registerToEvent,
  unregisterFromEvent,
  getUpcomingEvents,
  getNearbyEvents
} = require('../controllers/eventController');

// Middlewares
const { authenticate, authorize, authorizeMinimumRole, optionalAuthenticate } = require('../middleware/auth');
const { validate, eventSchema, searchSchema } = require('../middleware/validation');

/**
 * @route   GET /api/events
 * @desc    Obtenir tous les événements avec pagination et filtres
 * @access  Public (avec authentification optionnelle pour voir les statuts)
 */
router.get('/', optionalAuthenticate, validate(searchSchema, 'query'), getEvents);

/**
 * @route   GET /api/events/upcoming
 * @desc    Obtenir les événements à venir
 * @access  Public
 */
router.get('/upcoming', getUpcomingEvents);

/**
 * @route   GET /api/events/nearby
 * @desc    Rechercher des événements à proximité
 * @access  Public
 */
router.get('/nearby', getNearbyEvents);

/**
 * @route   GET /api/events/:id
 * @desc    Obtenir un événement par ID
 * @access  Public (avec authentification optionnelle pour voir les statuts)
 */
router.get('/:id', optionalAuthenticate, getEvent);

/**
 * @route   POST /api/events
 * @desc    Créer un nouvel événement
 * @access  Private (tous les utilisateurs connectés)
 */
router.post('/', authenticate, validate(eventSchema), createEvent);

/**
 * @route   PUT /api/events/:id
 * @desc    Mettre à jour un événement
 * @access  Private (propriétaire, éditeur ou admin)
 */
router.put('/:id', authenticate, validate(eventSchema), updateEvent);

/**
 * @route   DELETE /api/events/:id
 * @desc    Supprimer un événement
 * @access  Private (propriétaire, éditeur ou admin)
 */
router.delete('/:id', authenticate, deleteEvent);

/**
 * @route   POST /api/events/:id/validate
 * @desc    Valider un événement
 * @access  Private (éditeur ou admin seulement)
 */
router.post('/:id/validate', authenticate, authorizeMinimumRole('editor'), validateEvent);

/**
 * @route   POST /api/events/:id/register
 * @desc    S'inscrire à un événement
 * @access  Private (tous les utilisateurs connectés)
 */
router.post('/:id/register', authenticate, registerToEvent);

/**
 * @route   POST /api/events/:id/unregister
 * @desc    Se désinscrire d'un événement
 * @access  Private (tous les utilisateurs connectés)
 */
router.post('/:id/unregister', authenticate, unregisterFromEvent);

module.exports = router;

