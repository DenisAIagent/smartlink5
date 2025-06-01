const User = require('../models/User');

/**
 * Obtenir tous les utilisateurs (admin seulement)
 */
const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = 'createdAt',
      order = 'desc',
      q,
      role,
      isActive
    } = req.query;

    // Construction de la requête de recherche
    const query = {};

    // Recherche textuelle
    if (q) {
      query.$or = [
        { firstName: new RegExp(q, 'i') },
        { lastName: new RegExp(q, 'i') },
        { email: new RegExp(q, 'i') }
      ];
    }

    // Filtres spécifiques
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Options de pagination
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort]: order === 'desc' ? -1 : 1 },
      select: '-password -refreshToken -resetPasswordToken -resetPasswordExpires'
    };

    const result = await User.paginate(query, options);

    res.json({
      success: true,
      data: {
        users: result.docs,
        pagination: {
          currentPage: result.page,
          totalPages: result.totalPages,
          totalItems: result.totalDocs,
          itemsPerPage: result.limit,
          hasNextPage: result.hasNextPage,
          hasPrevPage: result.hasPrevPage
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtenir un utilisateur par ID (admin seulement)
 */
const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password -refreshToken -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Mettre à jour le rôle d'un utilisateur (admin seulement)
 */
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'editor', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rôle invalide'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Empêcher de modifier son propre rôle
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas modifier votre propre rôle'
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: 'Rôle utilisateur mis à jour avec succès',
      data: { 
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Activer/désactiver un utilisateur (admin seulement)
 */
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Empêcher de désactiver son propre compte
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas désactiver votre propre compte'
      });
    }

    user.isActive = !user.isActive;
    user.refreshToken = null; // Invalider les tokens si désactivé
    await user.save();

    res.json({
      success: true,
      message: `Utilisateur ${user.isActive ? 'activé' : 'désactivé'} avec succès`,
      data: { 
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors du changement de statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Supprimer un utilisateur (admin seulement)
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Empêcher de supprimer son propre compte
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte'
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtenir les statistiques des utilisateurs (admin seulement)
 */
const getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactiveUsers: { $sum: { $cond: ['$isActive', 0, 1] } },
          adminCount: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
          editorCount: { $sum: { $cond: [{ $eq: ['$role', 'editor'] }, 1, 0] } },
          userCount: { $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] } }
        }
      }
    ]);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email role createdAt');

    res.json({
      success: true,
      data: {
        stats: stats[0] || {
          totalUsers: 0,
          activeUsers: 0,
          inactiveUsers: 0,
          adminCount: 0,
          editorCount: 0,
          userCount: 0
        },
        recentUsers
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getUsers,
  getUser,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getUserStats
};

