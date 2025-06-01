const Provider = require('../models/Provider');

/**
 * Obtenir tous les prestataires avec pagination et filtres
 */
const getProviders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = 'createdAt',
      order = 'desc',
      q,
      type,
      city,
      tags,
      status = 'active',
      featured
    } = req.query;

    // Construction de la requête de recherche
    const query = {};

    // Filtre par statut (les utilisateurs normaux ne voient que les actifs)
    if (req.user && ['admin', 'editor'].includes(req.user.role)) {
      if (status) query.status = status;
    } else {
      query.status = 'active';
    }

    // Recherche textuelle
    if (q) {
      query.$text = { $search: q };
    }

    // Filtres spécifiques
    if (type) query.type = type;
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }
    if (featured !== undefined) query.featured = featured === 'true';

    // Options de pagination
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort]: order === 'desc' ? -1 : 1 },
      populate: [
        { path: 'createdBy', select: 'firstName lastName email' },
        { path: 'validatedBy', select: 'firstName lastName email' }
      ]
    };

    // Si recherche textuelle, trier par score de pertinence
    if (q) {
      options.sort = { score: { $meta: 'textScore' } };
    }

    const result = await Provider.paginate(query, options);

    res.json({
      success: true,
      data: {
        providers: result.docs,
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
    console.error('Erreur lors de la récupération des prestataires:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtenir un prestataire par ID
 */
const getProvider = async (req, res) => {
  try {
    const { id } = req.params;

    const provider = await Provider.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('validatedBy', 'firstName lastName email');

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Prestataire non trouvé'
      });
    }

    // Vérifier les permissions d'accès
    if (provider.status !== 'active' && 
        (!req.user || !['admin', 'editor'].includes(req.user.role))) {
      return res.status(404).json({
        success: false,
        message: 'Prestataire non trouvé'
      });
    }

    res.json({
      success: true,
      data: { provider }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du prestataire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Créer un nouveau prestataire
 */
const createProvider = async (req, res) => {
  try {
    const providerData = {
      ...req.body,
      createdBy: req.user._id,
      status: req.user.role === 'admin' ? 'active' : 'pending'
    };

    const provider = new Provider(providerData);
    await provider.save();

    // Populer les références
    await provider.populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Prestataire créé avec succès',
      data: { provider }
    });

  } catch (error) {
    console.error('Erreur lors de la création du prestataire:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Données de validation invalides',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Mettre à jour un prestataire
 */
const updateProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const provider = await Provider.findById(id);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Prestataire non trouvé'
      });
    }

    // Vérifier les permissions de modification
    if (req.user.role === 'user' && 
        (provider.createdBy.toString() !== req.user._id.toString() || 
         provider.status !== 'pending')) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez modifier que vos propres prestataires en attente'
      });
    }

    // Les éditeurs peuvent modifier leurs prestataires et ceux en attente
    if (req.user.role === 'editor' && 
        provider.createdBy.toString() !== req.user._id.toString() && 
        provider.status !== 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez modifier que vos prestataires ou ceux en attente de validation'
      });
    }

    // Mettre à jour les champs
    Object.keys(updateData).forEach(key => {
      if (key !== 'createdBy' && key !== 'validatedBy' && key !== 'validatedAt') {
        provider[key] = updateData[key];
      }
    });

    await provider.save();
    await provider.populate('createdBy', 'firstName lastName email');
    await provider.populate('validatedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Prestataire mis à jour avec succès',
      data: { provider }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du prestataire:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Données de validation invalides',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Supprimer un prestataire
 */
const deleteProvider = async (req, res) => {
  try {
    const { id } = req.params;

    const provider = await Provider.findById(id);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Prestataire non trouvé'
      });
    }

    // Vérifier les permissions de suppression
    if (req.user.role === 'user' && 
        (provider.createdBy.toString() !== req.user._id.toString() || 
         provider.status !== 'pending')) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez supprimer que vos propres prestataires en attente'
      });
    }

    if (req.user.role === 'editor' && 
        provider.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez supprimer que vos propres prestataires'
      });
    }

    await Provider.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Prestataire supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du prestataire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Valider un prestataire (admin/editor seulement)
 */
const validateProvider = async (req, res) => {
  try {
    const { id } = req.params;

    const provider = await Provider.findById(id);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Prestataire non trouvé'
      });
    }

    if (provider.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'Ce prestataire est déjà validé'
      });
    }

    await provider.validate(req.user._id);
    await provider.populate('validatedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Prestataire validé avec succès',
      data: { provider }
    });

  } catch (error) {
    console.error('Erreur lors de la validation du prestataire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Rechercher des prestataires à proximité
 */
const getNearbyProviders = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10000 } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Longitude et latitude requises'
      });
    }

    const providers = await Provider.findNearby(
      parseFloat(longitude),
      parseFloat(latitude),
      parseInt(maxDistance)
    ).populate('createdBy', 'firstName lastName email');

    res.json({
      success: true,
      data: { providers }
    });

  } catch (error) {
    console.error('Erreur lors de la recherche de proximité:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getProviders,
  getProvider,
  createProvider,
  updateProvider,
  deleteProvider,
  validateProvider,
  getNearbyProviders
};

