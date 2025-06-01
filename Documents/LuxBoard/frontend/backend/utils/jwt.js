const jwt = require('jsonwebtoken');

/**
 * Génère un token JWT d'accès
 * @param {Object} payload - Les données à inclure dans le token
 * @returns {String} Token JWT
 */
const generateAccessToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRE || '7d',
      issuer: 'luxboard-api',
      audience: 'luxboard-client'
    }
  );
};

/**
 * Génère un token JWT de rafraîchissement
 * @param {Object} payload - Les données à inclure dans le token
 * @returns {String} Token JWT de rafraîchissement
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { 
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
      issuer: 'luxboard-api',
      audience: 'luxboard-client'
    }
  );
};

/**
 * Vérifie un token JWT d'accès
 * @param {String} token - Le token à vérifier
 * @returns {Object} Payload décodé
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'luxboard-api',
      audience: 'luxboard-client'
    });
  } catch (error) {
    throw new Error('Token d\'accès invalide');
  }
};

/**
 * Vérifie un token JWT de rafraîchissement
 * @param {String} token - Le token à vérifier
 * @returns {Object} Payload décodé
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer: 'luxboard-api',
      audience: 'luxboard-client'
    });
  } catch (error) {
    throw new Error('Token de rafraîchissement invalide');
  }
};

/**
 * Génère une paire de tokens (accès + rafraîchissement)
 * @param {Object} user - L'utilisateur pour lequel générer les tokens
 * @returns {Object} Objet contenant les deux tokens
 */
const generateTokenPair = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ id: user._id });

  return {
    accessToken,
    refreshToken,
    tokenType: 'Bearer',
    expiresIn: process.env.JWT_EXPIRE || '7d'
  };
};

/**
 * Extrait le token du header Authorization
 * @param {String} authHeader - Header Authorization
 * @returns {String|null} Token extrait ou null
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Enlever 'Bearer '
};

/**
 * Vérifie si un token est expiré
 * @param {String} token - Le token à vérifier
 * @returns {Boolean} True si le token est expiré
 */
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Décode un token sans le vérifier (pour récupérer les infos)
 * @param {String} token - Le token à décoder
 * @returns {Object|null} Payload décodé ou null
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

/**
 * Génère un token de réinitialisation de mot de passe
 * @param {String} userId - ID de l'utilisateur
 * @returns {String} Token de réinitialisation
 */
const generatePasswordResetToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'password_reset' },
    process.env.JWT_SECRET,
    { 
      expiresIn: '1h',
      issuer: 'luxboard-api',
      audience: 'luxboard-client'
    }
  );
};

/**
 * Vérifie un token de réinitialisation de mot de passe
 * @param {String} token - Le token à vérifier
 * @returns {Object} Payload décodé
 */
const verifyPasswordResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'luxboard-api',
      audience: 'luxboard-client'
    });
    
    if (decoded.type !== 'password_reset') {
      throw new Error('Type de token invalide');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('Token de réinitialisation invalide ou expiré');
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
  extractTokenFromHeader,
  isTokenExpired,
  decodeToken,
  generatePasswordResetToken,
  verifyPasswordResetToken
};

