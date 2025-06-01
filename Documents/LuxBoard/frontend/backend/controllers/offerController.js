const Offer = require('../models/Offer');
const Provider = require('../models/Provider');

/**
 * Obtenir toutes les offres avec pagination et filtres
 */
const getOffers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = 'createdAt',
      order = 'desc',
      q,
      type,
      provider,
      status,
      isActive,
      featured
    } = req.query;

    // Construction de la requête de recherche
    const query = {};

    // Recherche textuelle
    if (q) {
      query.$text = { $search: q };
    }

    // Filtres spécifiques
    if (type) query.type = type;
    if (provider) query.provider = provider;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (featured !== undefined) query.featured = featured === 'true';

    // Filtre par statut pour les admins/éditeurs
    if (req.user && ['admin', 'editor'].includes(req.user.role)) {
      if (status) {
        switch (status) {
          case 'active':
            query.isActive = true;
            query.validFrom = { $lte: new Date() };
            query.validUntil = { $gte: new Date() };
            break;
          case 'upcoming':
            query.isActive = true;
            query.validFrom = { $gt: new Date() };
            break;
          case 'expired':
            query.validUntil = { $lt: new Date() };
            break;
          case 'inactive':
            query.isActive = false;
            break;
        }
      }
    } else {
      // Pour les utilisateurs normaux, ne montrer que les offres actives et valides
      const now = new Date();
      query.isActive = true;
      query.validFrom = { $lte: now };
      query.validUntil = { $gte: now };
    }

    // Options de pagination
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort]: order === 'desc' ? -1 : 1 },
      populate: [
        { 
          path: 'provider', 
          select: 'name type address.city pricing.level images tags status',
          match: { status: 'active' }
        },
        { path: 'createdBy', select: 'firstName lastName email' },
        { path: 'validatedBy', select: 'firstName lastName email' }
      ]
    };

    // Si recherche textuelle, trier par score de pertinence
    if (q) {
      options.sort = { score: { $meta: 'textScore' } };
    }

    const result = await Offer.paginate(query, options);

    // Filtrer les offres dont le prestataire n'est pas actif
    result.docs = result.docs.filter(offer => offer.provider);

    res.json({
      success: true,
      data: {
        offers: result.docs,
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
    console.error('Erreur lors de la récupération des offres:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtenir une offre par ID
 */
const getOffer = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await Offer.findById(id)
      .populate('provider', 'name type description address contact pricing images tags')
      .populate('createdBy', 'firstName lastName email')
      .populate('validatedBy', 'firstName lastName email');

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée'
      });
    }

    // Vérifier si l'offre est accessible
    if (!offer.isValid && (!req.user || !['admin', 'editor'].includes(req.user.role))) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée'
      });
    }

    res.json({
      success: true,
      data: { offer }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Créer une nouvelle offre
 */
const createOffer = async (req, res) => {
  try {
    // Vérifier que le prestataire existe et est actif
    const provider = await Provider.findById(req.body.provider);
    if (!provider || provider.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Prestataire non trouvé ou non actif'
      });
    }

    const offerData = {
      ...req.body,
      createdBy: req.user._id
    };

    const offer = new Offer(offerData);
    await offer.save();

    // Populer les références
    await offer.populate('provider', 'name type address.city');
    await offer.populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Offre créée avec succès',
      data: { offer }
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'offre:', error);
    
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
 * Mettre à jour une offre
 */
const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée'
      });
    }

    // Vérifier les permissions de modification
    if (req.user.role === 'user' && 
        offer.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez modifier que vos propres offres'
      });
    }

    // Si le prestataire est modifié, vérifier qu'il existe et est actif
    if (updateData.provider && updateData.provider !== offer.provider.toString()) {
      const provider = await Provider.findById(updateData.provider);
      if (!provider || provider.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Prestataire non trouvé ou non actif'
        });
      }
    }

    // Mettre à jour les champs
    Object.keys(updateData).forEach(key => {
      if (key !== 'createdBy' && key !== 'validatedBy' && key !== 'validatedAt' && key !== 'currentUses') {
        offer[key] = updateData[key];
      }
    });

    await offer.save();
    await offer.populate('provider', 'name type address.city');
    await offer.populate('createdBy', 'firstName lastName email');
    await offer.populate('validatedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Offre mise à jour avec succès',
      data: { offer }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'offre:', error);
    
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
 * Supprimer une offre
 */
const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée'
      });
    }

    // Vérifier les permissions de suppression
    if (req.user.role === 'user' && 
        offer.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez supprimer que vos propres offres'
      });
    }

    if (req.user.role === 'editor' && 
        offer.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez supprimer que vos propres offres'
      });
    }

    await Offer.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Offre supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Utiliser une offre (incrémenter le compteur d'utilisation)
 */
const useOffer = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await Offer.findById(id).populate('provider', 'name');
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée'
      });
    }

    try {
      await offer.use();
      
      res.json({
        success: true,
        message: 'Offre utilisée avec succès',
        data: { 
          offer: {
            id: offer._id,
            title: offer.title,
            currentUses: offer.currentUses,
            maxUses: offer.maxUses,
            usagePercentage: offer.usagePercentage
          }
        }
      });
    } catch (useError) {
      return res.status(400).json({
        success: false,
        message: useError.message
      });
    }

  } catch (error) {
    console.error('Erreur lors de l\'utilisation de l\'offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Valider une offre (admin/editor seulement)
 */
const validateOffer = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée'
      });
    }

    await offer.validate(req.user._id);
    await offer.populate('validatedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Offre validée avec succès',
      data: { offer }
    });

  } catch (error) {
    console.error('Erreur lors de la validation de l\'offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtenir les offres qui expirent bientôt
 */
const getExpiringSoonOffers = async (req, res) => {
  try {
    const { days = 7 } = req.query;

    const offers = await Offer.findExpiringSoon(parseInt(days));

    res.json({
      success: true,
      data: { offers }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des offres expirant bientôt:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getOffers,
  getOffer,
  createOffer,
  updateOffer,
  deleteOffer,
  useOffer,
  validateOffer,
  getExpiringSoonOffers
};

