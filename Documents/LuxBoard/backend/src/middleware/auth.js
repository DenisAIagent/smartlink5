const jwt = require('jsonwebtoken');
const { User } = require('../models');

const validateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        error: 'Token d\'authentification manquant'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        error: 'Utilisateur non trouvé'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(401).json({
      error: 'Token invalide'
    });
  }
};

const validateAdmin = async (req, res, next) => {
  try {
    await validateToken(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Accès non autorisé'
        });
      }
      next();
    });
  } catch (error) {
    console.error('Erreur de validation admin:', error);
    res.status(500).json({
      error: 'Erreur lors de la validation des droits d\'administration'
    });
  }
};

module.exports = {
  validateToken,
  validateAdmin
}; 