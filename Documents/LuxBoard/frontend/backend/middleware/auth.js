const { verifyAccessToken, extractTokenFromHeader } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Middleware d'authentification
 * Vérifie la présence et la validité du token JWT
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification requis'
      });
    }

    // Vérifier le token
    const decoded = verifyAccessToken(token);
    
    // Récupérer l'utilisateur depuis la base de données
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Compte utilisateur désactivé'
      });
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token invalide',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Middleware d'autorisation par rôle
 * @param {...string} roles - Rôles autorisés
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permissions insuffisantes'
      });
    }

    next();
  };
};

/**
 * Middleware d'autorisation par hiérarchie de rôles
 * @param {string} minimumRole - Rôle minimum requis
 */
const authorizeMinimumRole = (minimumRole) => {
  const roleHierarchy = {
    'user': 1,
    'editor': 2,
    'admin': 3
  };

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    const userLevel = roleHierarchy[req.user.role] || 0;
    const requiredLevel = roleHierarchy[minimumRole] || 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        success: false,
        message: 'Permissions insuffisantes'
      });
    }

    next();
  };
};

/**
 * Middleware d'autorisation pour les ressources propres
 * Permet à un utilisateur d'accéder seulement à ses propres ressources
 * ou aux admins/éditeurs d'accéder à toutes les ressources
 */
const authorizeOwnerOrEditor = (resourceUserField = 'createdBy') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    // Les admins et éditeurs ont accès à tout
    if (['admin', 'editor'].includes(req.user.role)) {
      return next();
    }

    // Pour les utilisateurs normaux, vérifier la propriété de la ressource
    // Cette vérification sera faite dans le contrôleur avec req.resource
    req.checkOwnership = {
      field: resourceUserField,
      userId: req.user._id
    };

    next();
  };
};

/**
 * Middleware optionnel d'authentification
 * N'échoue pas si aucun token n'est fourni, mais ajoute l'utilisateur si le token est valide
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      // Pas de token, continuer sans utilisateur
      return next();
    }

    // Vérifier le token
    const decoded = verifyAccessToken(token);
    
    // Récupérer l'utilisateur depuis la base de données
    const user = await User.findById(decoded.id).select('-password');
    
    if (user && user.isActive) {
      req.user = user;
    }

    next();

  } catch (error) {
    // Token invalide, continuer sans utilisateur
    next();
  }
};

/**
 * Middleware pour vérifier si l'utilisateur peut modifier une ressource spécifique
 * @param {Function} getResource - Fonction pour récupérer la ressource
 */
const canModifyResource = (getResource) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise'
        });
      }

      // Les admins peuvent tout modifier
      if (req.user.role === 'admin') {
        return next();
      }

      // Récupérer la ressource
      const resource = await getResource(req);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Ressource non trouvée'
        });
      }

      // Les éditeurs peuvent modifier les ressources validées et les leurs
      if (req.user.role === 'editor') {
        if (resource.createdBy.toString() === req.user._id.toString() || 
            resource.status === 'pending') {
          return next();
        }
      }

      // Les utilisateurs ne peuvent modifier que leurs propres ressources non validées
      if (req.user.role === 'user') {
        if (resource.createdBy.toString() === req.user._id.toString() && 
            resource.status === 'pending') {
          return next();
        }
      }

      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas les permissions pour modifier cette ressource'
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification des permissions',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

module.exports = {
  authenticate,
  authorize,
  authorizeMinimumRole,
  authorizeOwnerOrEditor,
  optionalAuthenticate,
  canModifyResource
};

