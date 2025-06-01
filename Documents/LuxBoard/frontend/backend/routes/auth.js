const express = require('express');
const router = express.Router();

// Contrôleurs
const {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword
} = require('../controllers/authController');

// Middlewares
const { authenticate } = require('../middleware/auth');
const { 
  validate, 
  registerSchema, 
  loginSchema, 
  updateProfileSchema, 
  changePasswordSchema 
} = require('../middleware/validation');

/**
 * @route   POST /api/auth/register
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 */
router.post('/register', validate(registerSchema), register);

/**
 * @route   POST /api/auth/login
 * @desc    Connexion d'un utilisateur
 * @access  Public
 */
router.post('/login', validate(loginSchema), login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Rafraîchir le token d'accès
 * @access  Public
 */
router.post('/refresh', refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Déconnexion d'un utilisateur
 * @access  Private
 */
router.post('/logout', authenticate, logout);

/**
 * @route   GET /api/auth/profile
 * @desc    Obtenir le profil de l'utilisateur connecté
 * @access  Private
 */
router.get('/profile', authenticate, getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Mettre à jour le profil de l'utilisateur
 * @access  Private
 */
router.put('/profile', authenticate, validate(updateProfileSchema), updateProfile);

/**
 * @route   PUT /api/auth/password
 * @desc    Changer le mot de passe
 * @access  Private
 */
router.put('/password', authenticate, validate(changePasswordSchema), changePassword);

module.exports = router;

