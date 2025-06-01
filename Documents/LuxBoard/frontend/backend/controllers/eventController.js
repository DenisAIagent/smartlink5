const Event = require('../models/Event');

/**
 * Obtenir tous les événements avec pagination et filtres
 */
const getEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = 'dates.startDate',
      order = 'asc',
      q,
      type,
      city,
      status,
      isExclusive,
      isUpcoming,
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
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (isExclusive !== undefined) query.isExclusive = isExclusive === 'true';
    if (featured !== undefined) query.featured = featured === 'true';

    // Filtre par statut pour les admins/éditeurs
    if (req.user && ['admin', 'editor'].includes(req.user.role)) {
      if (status) query.status = status;
    } else {
      query.status = 'active';
    }

    // Filtre pour les événements à venir
    if (isUpcoming === 'true') {
      query['dates.startDate'] = { $gt: new Date() };
    }

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

    const result = await Event.paginate(query, options);

    res.json({
      success: true,
      data: {
        events: result.docs,
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
    console.error('Erreur lors de la récupération des événements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtenir un événement par ID
 */
const getEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('validatedBy', 'firstName lastName email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    // Vérifier les permissions d'accès
    if (event.status !== 'active' && 
        (!req.user || !['admin', 'editor'].includes(req.user.role))) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    res.json({
      success: true,
      data: { event }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Créer un nouveau événement
 */
const createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.user._id,
      status: req.user.role === 'admin' ? 'active' : 'pending'
    };

    const event = new Event(eventData);
    await event.save();

    // Populer les références
    await event.populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Événement créé avec succès',
      data: { event }
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    
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
 * Mettre à jour un événement
 */
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    // Vérifier les permissions de modification
    if (req.user.role === 'user' && 
        (event.createdBy.toString() !== req.user._id.toString() || 
         event.status !== 'pending')) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez modifier que vos propres événements en attente'
      });
    }

    if (req.user.role === 'editor' && 
        event.createdBy.toString() !== req.user._id.toString() && 
        event.status !== 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez modifier que vos événements ou ceux en attente de validation'
      });
    }

    // Mettre à jour les champs
    Object.keys(updateData).forEach(key => {
      if (key !== 'createdBy' && key !== 'validatedBy' && key !== 'validatedAt' && key !== 'capacity.current') {
        event[key] = updateData[key];
      }
    });

    await event.save();
    await event.populate('createdBy', 'firstName lastName email');
    await event.populate('validatedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Événement mis à jour avec succès',
      data: { event }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error);
    
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
 * Supprimer un événement
 */
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    // Vérifier les permissions de suppression
    if (req.user.role === 'user' && 
        (event.createdBy.toString() !== req.user._id.toString() || 
         event.status !== 'pending')) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez supprimer que vos propres événements en attente'
      });
    }

    if (req.user.role === 'editor' && 
        event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez supprimer que vos propres événements'
      });
    }

    await Event.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Événement supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Valider un événement (admin/editor seulement)
 */
const validateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    if (event.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cet événement est déjà validé'
      });
    }

    await event.validate(req.user._id);
    await event.populate('validatedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Événement validé avec succès',
      data: { event }
    });

  } catch (error) {
    console.error('Erreur lors de la validation de l\'événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * S'inscrire à un événement
 */
const registerToEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    if (event.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cet événement n\'est pas disponible pour inscription'
      });
    }

    if (event.isPast) {
      return res.status(400).json({
        success: false,
        message: 'Cet événement est déjà terminé'
      });
    }

    try {
      await event.addParticipant();
      
      res.json({
        success: true,
        message: event.isFull ? 'Ajouté en liste d\'attente' : 'Inscription réussie',
        data: { 
          event: {
            id: event._id,
            title: event.title,
            capacity: event.capacity,
            isFull: event.isFull,
            fillPercentage: event.fillPercentage
          }
        }
      });
    } catch (registrationError) {
      return res.status(400).json({
        success: false,
        message: registrationError.message
      });
    }

  } catch (error) {
    console.error('Erreur lors de l\'inscription à l\'événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Se désinscrire d'un événement
 */
const unregisterFromEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    await event.removeParticipant();

    res.json({
      success: true,
      message: 'Désinscription réussie',
      data: { 
        event: {
          id: event._id,
          title: event.title,
          capacity: event.capacity,
          isFull: event.isFull,
          fillPercentage: event.fillPercentage
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la désinscription de l\'événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtenir les événements à venir
 */
const getUpcomingEvents = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const events = await Event.findUpcoming(parseInt(limit));

    res.json({
      success: true,
      data: { events }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des événements à venir:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Rechercher des événements à proximité
 */
const getNearbyEvents = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 50000 } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Longitude et latitude requises'
      });
    }

    const events = await Event.findNearby(
      parseFloat(longitude),
      parseFloat(latitude),
      parseInt(maxDistance)
    );

    res.json({
      success: true,
      data: { events }
    });

  } catch (error) {
    console.error('Erreur lors de la recherche d\'événements à proximité:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
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
};

