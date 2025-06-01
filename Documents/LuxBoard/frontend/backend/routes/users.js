const express = require('express');
const router = express.Router();

// Contrôleurs
const {
  getUsers,
  getUser,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getUserStats
} = require('../controllers/userController');

// Middlewares
const { authenticate, authorize } = require('../middleware/auth');
const { validate, searchSchema } = require('../middleware/validation');

/**
 * @route   GET /api/users
 * @desc    Obtenir tous les utilisateurs avec pagination et filtres
 * @access  Private (admin seulement)
 */
router.get('/', authenticate, authorize('admin'), validate(searchSchema, 'query'), getUsers);

/**
 * @route   GET /api/users/stats
 * @desc    Obtenir les statistiques des utilisateurs
 * @access  Private (admin seulement)
 */
router.get('/stats', authenticate, authorize('admin'), getUserStats);

/**
 * @route   GET /api/users/:id
 * @desc    Obtenir un utilisateur par ID
 * @access  Private (admin seulement)
 */
router.get('/:id', authenticate, authorize('admin'), getUser);

/**
 * @route   PUT /api/users/:id/role
 * @desc    Mettre à jour le rôle d'un utilisateur
 * @access  Private (admin seulement)
 */
router.put('/:id/role', authenticate, authorize('admin'), updateUserRole);

/**
 * @route   PUT /api/users/:id/toggle-status
 * @desc    Activer/désactiver un utilisateur
 * @access  Private (admin seulement)
 */
router.put('/:id/toggle-status', authenticate, authorize('admin'), toggleUserStatus);

/**
 * @route   DELETE /api/users/:id
 * @desc    Supprimer un utilisateur
 * @access  Private (admin seulement)
 */
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

module.exports = router;

