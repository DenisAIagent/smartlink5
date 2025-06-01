const Joi = require('joi');

/**
 * Middleware de validation des données
 * @param {Object} schema - Schéma de validation Joi
 * @param {string} source - Source des données à valider ('body', 'params', 'query')
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];
    
    const { error, value } = schema.validate(data, {
      abortEarly: false, // Retourner toutes les erreurs
      stripUnknown: true, // Supprimer les champs non définis dans le schéma
      convert: true // Convertir les types automatiquement
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Données de validation invalides',
        errors
      });
    }

    // Remplacer les données par les données validées et nettoyées
    req[source] = value;
    next();
  };
};

// Schémas de validation communs

// Validation pour l'inscription
const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Format d\'email invalide',
      'any.required': 'L\'email est requis'
    }),
  password: Joi.string()
    .min(6)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .required()
    .messages({
      'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
      'string.pattern.base': 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre',
      'any.required': 'Le mot de passe est requis'
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'La confirmation du mot de passe ne correspond pas',
      'any.required': 'La confirmation du mot de passe est requise'
    }),
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Le prénom doit contenir au moins 2 caractères',
      'string.max': 'Le prénom ne peut pas dépasser 50 caractères',
      'any.required': 'Le prénom est requis'
    }),
  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Le nom doit contenir au moins 2 caractères',
      'string.max': 'Le nom ne peut pas dépasser 50 caractères',
      'any.required': 'Le nom est requis'
    })
});

// Validation pour la connexion
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Format d\'email invalide',
      'any.required': 'L\'email est requis'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Le mot de passe est requis'
    })
});

// Validation pour la création d'un prestataire
const providerSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required(),
  type: Joi.string()
    .valid('restaurant', 'hotel', 'spa', 'service', 'transport', 'culture', 'artisan', 'coach', 'sante')
    .required(),
  description: Joi.string()
    .trim()
    .min(10)
    .max(2000)
    .required(),
  address: Joi.object({
    street: Joi.string().trim().max(200).required(),
    city: Joi.string().trim().max(100).required(),
    postalCode: Joi.string().pattern(/^\d{5}$/).required(),
    country: Joi.string().trim().max(100).default('France'),
    coordinates: Joi.array().items(Joi.number()).length(2).optional()
  }).required(),
  contact: Joi.object({
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^(?:\+33|0)[1-9](?:[0-9]{8})$/).optional(),
    website: Joi.string().uri().optional()
  }).optional(),
  pricing: Joi.object({
    level: Joi.string().valid('€', '€€', '€€€', '€€€€').required(),
    description: Joi.string().trim().max(500).optional()
  }).required(),
  tags: Joi.array().items(Joi.string().trim().max(50)).optional(),
  metadata: Joi.object({
    siret: Joi.string().pattern(/^\d{14}$/).optional(),
    openingHours: Joi.string().trim().max(500).optional(),
    specialties: Joi.array().items(Joi.string().trim().max(100)).optional()
  }).optional()
});

// Validation pour la création d'une offre
const offerSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(5)
    .max(200)
    .required(),
  description: Joi.string()
    .trim()
    .min(10)
    .max(2000)
    .required(),
  provider: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'ID de prestataire invalide'
    }),
  type: Joi.string()
    .valid('discount', 'exclusive', 'upgrade', 'gift', 'experience')
    .required(),
  value: Joi.object({
    type: Joi.string().valid('percentage', 'fixed', 'upgrade', 'gift').required(),
    amount: Joi.number().min(0).when('type', {
      is: Joi.valid('percentage', 'fixed'),
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    description: Joi.string().trim().max(200).optional()
  }).required(),
  validFrom: Joi.date()
    .iso()
    .required(),
  validUntil: Joi.date()
    .iso()
    .greater(Joi.ref('validFrom'))
    .required(),
  conditions: Joi.string()
    .trim()
    .max(1000)
    .optional(),
  contactInfo: Joi.string()
    .trim()
    .max(500)
    .optional(),
  url: Joi.string()
    .uri()
    .optional(),
  code: Joi.string()
    .trim()
    .uppercase()
    .max(50)
    .optional(),
  maxUses: Joi.number()
    .integer()
    .min(1)
    .optional(),
  tags: Joi.array()
    .items(Joi.string().trim().max(50))
    .optional()
});

// Validation pour la création d'un événement
const eventSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(5)
    .max(200)
    .required(),
  description: Joi.string()
    .trim()
    .min(10)
    .max(3000)
    .required(),
  type: Joi.string()
    .valid('conference', 'gala', 'exhibition', 'workshop', 'networking', 'cultural', 'gastronomic', 'wellness', 'sport', 'private')
    .required(),
  dates: Joi.array()
    .items(
      Joi.object({
        startDate: Joi.date().iso().required(),
        endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
        description: Joi.string().trim().max(200).optional()
      })
    )
    .min(1)
    .required(),
  location: Joi.object({
    name: Joi.string().trim().max(200).required(),
    address: Joi.string().trim().max(300).required(),
    city: Joi.string().trim().max(100).required(),
    postalCode: Joi.string().pattern(/^\d{5}$/).optional(),
    country: Joi.string().trim().max(100).default('France'),
    coordinates: Joi.array().items(Joi.number()).length(2).optional()
  }).required(),
  pricing: Joi.object({
    isFree: Joi.boolean().default(false),
    basePrice: Joi.number().min(0).default(0),
    currency: Joi.string().valid('EUR', 'USD', 'GBP').default('EUR'),
    description: Joi.string().trim().max(500).optional(),
    url: Joi.string().uri().optional()
  }).optional(),
  capacity: Joi.object({
    max: Joi.number().integer().min(1).optional()
  }).optional(),
  contact: Joi.object({
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^(?:\+33|0)[1-9](?:[0-9]{8})$/).optional(),
    website: Joi.string().uri().optional(),
    person: Joi.string().trim().max(100).optional()
  }).optional(),
  organizer: Joi.object({
    name: Joi.string().trim().max(200).required(),
    description: Joi.string().trim().max(1000).optional(),
    website: Joi.string().uri().optional()
  }).required(),
  tags: Joi.array()
    .items(Joi.string().trim().max(50))
    .optional(),
  isExclusive: Joi.boolean().default(false),
  isPrivate: Joi.boolean().default(false),
  requiresApproval: Joi.boolean().default(false)
});

// Validation pour la mise à jour du profil utilisateur
const updateProfileSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .optional(),
  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .optional(),
  avatar: Joi.string()
    .uri()
    .optional()
});

// Validation pour le changement de mot de passe
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Le mot de passe actuel est requis'
    }),
  newPassword: Joi.string()
    .min(6)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .required()
    .messages({
      'string.min': 'Le nouveau mot de passe doit contenir au moins 6 caractères',
      'string.pattern.base': 'Le nouveau mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre',
      'any.required': 'Le nouveau mot de passe est requis'
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'La confirmation du mot de passe ne correspond pas',
      'any.required': 'La confirmation du mot de passe est requise'
    })
});

// Validation pour les paramètres de recherche
const searchSchema = Joi.object({
  q: Joi.string().trim().max(100).optional(),
  type: Joi.string().optional(),
  city: Joi.string().trim().max(100).optional(),
  tags: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string().valid('name', 'createdAt', 'rating', 'featured').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  providerSchema,
  offerSchema,
  eventSchema,
  updateProfileSchema,
  changePasswordSchema,
  searchSchema
};

