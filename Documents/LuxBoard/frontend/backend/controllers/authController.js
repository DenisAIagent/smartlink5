const User = require('../models/User');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwt');

/**
 * Inscription d'un nouvel utilisateur
 */
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Créer le nouvel utilisateur
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role: 'user' // Par défaut, les nouveaux utilisateurs sont des utilisateurs normaux
    });

    await user.save();

    // Générer les tokens
    const tokens = generateTokenPair(user);

    // Mettre à jour le refresh token dans la base
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          fullName: user.fullName,
          initials: user.initials
        },
        tokens
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Connexion d'un utilisateur
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur par email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé. Contactez l\'administrateur.'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Générer les tokens
    const tokens = generateTokenPair(user);

    // Mettre à jour le refresh token et la dernière connexion
    user.refreshToken = tokens.refreshToken;
    await user.updateLastLogin();

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          fullName: user.fullName,
          initials: user.initials,
          lastLogin: user.lastLogin
        },
        tokens
      }
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Rafraîchissement du token d'accès
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Token de rafraîchissement requis'
      });
    }

    // Vérifier le refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Trouver l'utilisateur
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Token de rafraîchissement invalide'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé'
      });
    }

    // Générer de nouveaux tokens
    const tokens = generateTokenPair(user);

    // Mettre à jour le refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json({
      success: true,
      message: 'Token rafraîchi avec succès',
      data: {
        tokens
      }
    });

  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);
    res.status(401).json({
      success: false,
      message: 'Token de rafraîchissement invalide',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Déconnexion d'un utilisateur
 */
const logout = async (req, res) => {
  try {
    const user = req.user;

    // Supprimer le refresh token
    user.refreshToken = null;
    await user.save();

    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });

  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtenir le profil de l'utilisateur connecté
 */
const getProfile = async (req, res) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          fullName: user.fullName,
          initials: user.initials,
          avatar: user.avatar,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Mettre à jour le profil de l'utilisateur
 */
const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { firstName, lastName, avatar } = req.body;

    // Mettre à jour les champs modifiables
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          fullName: user.fullName,
          initials: user.initials,
          avatar: user.avatar,
          updatedAt: user.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Changer le mot de passe
 */
const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    const { currentPassword, newPassword } = req.body;

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }

    // Mettre à jour le mot de passe
    user.password = newPassword;
    user.refreshToken = null; // Invalider tous les refresh tokens
    await user.save();

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });

  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword
};

