const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const providerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du prestataire est requis'],
    trim: true,
    maxlength: [200, 'Le nom ne peut pas dépasser 200 caractères']
  },
  type: {
    type: String,
    required: [true, 'Le type de prestataire est requis'],
    enum: {
      values: ['restaurant', 'hotel', 'spa', 'service', 'transport', 'culture', 'artisan', 'coach', 'sante'],
      message: 'Type de prestataire invalide'
    }
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true,
    maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères']
  },
  address: {
    street: {
      type: String,
      required: [true, 'L\'adresse est requise'],
      trim: true,
      maxlength: [200, 'L\'adresse ne peut pas dépasser 200 caractères']
    },
    city: {
      type: String,
      required: [true, 'La ville est requise'],
      trim: true,
      maxlength: [100, 'La ville ne peut pas dépasser 100 caractères']
    },
    postalCode: {
      type: String,
      required: [true, 'Le code postal est requis'],
      trim: true,
      match: [/^\d{5}$/, 'Format de code postal invalide (5 chiffres)']
    },
    country: {
      type: String,
      required: [true, 'Le pays est requis'],
      trim: true,
      default: 'France',
      maxlength: [100, 'Le pays ne peut pas dépasser 100 caractères']
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere',
      default: null
    }
  },
  contact: {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Format d\'email invalide']
    },
    phone: {
      type: String,
      trim: true,
      match: [/^(?:\+33|0)[1-9](?:[0-9]{8})$/, 'Format de téléphone français invalide']
    },
    website: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'Format d\'URL invalide']
    }
  },
  pricing: {
    level: {
      type: String,
      enum: {
        values: ['€', '€€', '€€€', '€€€€'],
        message: 'Niveau de prix invalide'
      },
      required: [true, 'Le niveau de prix est requis']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'La description tarifaire ne peut pas dépasser 500 caractères']
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [50, 'Un tag ne peut pas dépasser 50 caractères']
  }],
  rating: {
    type: Number,
    min: [0, 'La note ne peut pas être négative'],
    max: [5, 'La note ne peut pas dépasser 5'],
    default: 0
  },
  reviewCount: {
    type: Number,
    min: [0, 'Le nombre d\'avis ne peut pas être négatif'],
    default: 0
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'pending', 'inactive', 'rejected'],
      message: 'Statut invalide'
    },
    default: 'pending'
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le créateur est requis']
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  validatedAt: {
    type: Date,
    default: null
  },
  metadata: {
    siret: {
      type: String,
      trim: true,
      match: [/^\d{14}$/, 'Format SIRET invalide (14 chiffres)']
    },
    openingHours: {
      type: String,
      trim: true,
      maxlength: [500, 'Les horaires ne peuvent pas dépasser 500 caractères']
    },
    specialties: [{
      type: String,
      trim: true,
      maxlength: [100, 'Une spécialité ne peut pas dépasser 100 caractères']
    }],
    awards: [{
      name: String,
      year: Number,
      description: String
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour optimiser les recherches
providerSchema.index({ name: 'text', description: 'text', tags: 'text' });
providerSchema.index({ type: 1 });
providerSchema.index({ status: 1 });
providerSchema.index({ 'address.city': 1 });
providerSchema.index({ 'address.coordinates': '2dsphere' });
providerSchema.index({ rating: -1 });
providerSchema.index({ featured: -1, createdAt: -1 });

// Virtual pour l'adresse complète
providerSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.postalCode} ${this.address.city}, ${this.address.country}`;
});

// Virtual pour l'image principale
providerSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0] || null;
});

// Méthode pour mettre à jour la note moyenne
providerSchema.methods.updateRating = function(newRating) {
  const totalRating = (this.rating * this.reviewCount) + newRating;
  this.reviewCount += 1;
  this.rating = totalRating / this.reviewCount;
  return this.save();
};

// Méthode pour valider le prestataire
providerSchema.methods.validate = function(validatorId) {
  this.status = 'active';
  this.validatedBy = validatorId;
  this.validatedAt = new Date();
  return this.save();
};

// Méthode pour rechercher par proximité
providerSchema.statics.findNearby = function(longitude, latitude, maxDistance = 10000) {
  return this.find({
    'address.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    },
    status: 'active'
  });
};

// Ajouter le plugin de pagination
providerSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Provider', providerSchema);

