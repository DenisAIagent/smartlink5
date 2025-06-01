const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre de l\'événement est requis'],
    trim: true,
    maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true,
    maxlength: [3000, 'La description ne peut pas dépasser 3000 caractères']
  },
  type: {
    type: String,
    enum: {
      values: ['conference', 'gala', 'exhibition', 'workshop', 'networking', 'cultural', 'gastronomic', 'wellness', 'sport', 'private'],
      message: 'Type d\'événement invalide'
    },
    required: [true, 'Le type d\'événement est requis']
  },
  dates: [{
    startDate: {
      type: Date,
      required: [true, 'La date de début est requise']
    },
    endDate: {
      type: Date,
      required: [true, 'La date de fin est requise'],
      validate: {
        validator: function(value) {
          return value >= this.startDate;
        },
        message: 'La date de fin doit être postérieure à la date de début'
      }
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'La description de la date ne peut pas dépasser 200 caractères']
    }
  }],
  location: {
    name: {
      type: String,
      required: [true, 'Le nom du lieu est requis'],
      trim: true,
      maxlength: [200, 'Le nom du lieu ne peut pas dépasser 200 caractères']
    },
    address: {
      type: String,
      required: [true, 'L\'adresse est requise'],
      trim: true,
      maxlength: [300, 'L\'adresse ne peut pas dépasser 300 caractères']
    },
    city: {
      type: String,
      required: [true, 'La ville est requise'],
      trim: true,
      maxlength: [100, 'La ville ne peut pas dépasser 100 caractères']
    },
    postalCode: {
      type: String,
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
  pricing: {
    isFree: {
      type: Boolean,
      default: false
    },
    basePrice: {
      type: Number,
      min: [0, 'Le prix ne peut pas être négatif'],
      default: 0
    },
    currency: {
      type: String,
      default: 'EUR',
      enum: ['EUR', 'USD', 'GBP']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'La description tarifaire ne peut pas dépasser 500 caractères']
    },
    url: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'Format d\'URL invalide']
    }
  },
  capacity: {
    max: {
      type: Number,
      min: [1, 'La capacité maximale doit être d\'au moins 1 personne']
    },
    current: {
      type: Number,
      min: [0, 'Le nombre actuel de participants ne peut pas être négatif'],
      default: 0
    },
    waitingList: {
      type: Number,
      min: [0, 'Le nombre de personnes en liste d\'attente ne peut pas être négatif'],
      default: 0
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
    },
    person: {
      type: String,
      trim: true,
      maxlength: [100, 'Le nom du contact ne peut pas dépasser 100 caractères']
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
  isExclusive: {
    type: Boolean,
    default: false
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  requiresApproval: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: {
      values: ['draft', 'active', 'cancelled', 'completed', 'pending'],
      message: 'Statut invalide'
    },
    default: 'pending'
  },
  organizer: {
    name: {
      type: String,
      required: [true, 'Le nom de l\'organisateur est requis'],
      trim: true,
      maxlength: [200, 'Le nom de l\'organisateur ne peut pas dépasser 200 caractères']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'La description de l\'organisateur ne peut pas dépasser 1000 caractères']
    },
    website: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'Format d\'URL invalide']
    }
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour optimiser les recherches
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ type: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ 'dates.startDate': 1 });
eventSchema.index({ 'dates.endDate': 1 });
eventSchema.index({ 'location.city': 1 });
eventSchema.index({ 'location.coordinates': '2dsphere' });
eventSchema.index({ featured: -1, 'dates.startDate': 1 });
eventSchema.index({ isExclusive: 1 });

// Virtual pour l'adresse complète
eventSchema.virtual('fullAddress').get(function() {
  const parts = [this.location.name, this.location.address];
  if (this.location.postalCode) {
    parts.push(`${this.location.postalCode} ${this.location.city}`);
  } else {
    parts.push(this.location.city);
  }
  parts.push(this.location.country);
  return parts.join(', ');
});

// Virtual pour l'image principale
eventSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0] || null;
});

// Virtual pour vérifier si l'événement est complet
eventSchema.virtual('isFull').get(function() {
  return this.capacity.max && this.capacity.current >= this.capacity.max;
});

// Virtual pour le pourcentage de remplissage
eventSchema.virtual('fillPercentage').get(function() {
  if (!this.capacity.max) return 0;
  return Math.round((this.capacity.current / this.capacity.max) * 100);
});

// Virtual pour vérifier si l'événement est à venir
eventSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  return this.dates.some(date => date.startDate > now);
});

// Virtual pour vérifier si l'événement est en cours
eventSchema.virtual('isOngoing').get(function() {
  const now = new Date();
  return this.dates.some(date => date.startDate <= now && date.endDate >= now);
});

// Virtual pour vérifier si l'événement est terminé
eventSchema.virtual('isPast').get(function() {
  const now = new Date();
  return this.dates.every(date => date.endDate < now);
});

// Virtual pour la prochaine date
eventSchema.virtual('nextDate').get(function() {
  const now = new Date();
  const futureDates = this.dates.filter(date => date.startDate > now);
  if (futureDates.length === 0) return null;
  
  return futureDates.sort((a, b) => a.startDate - b.startDate)[0];
});

// Méthode pour inscrire un participant
eventSchema.methods.addParticipant = function() {
  if (this.isFull) {
    this.capacity.waitingList += 1;
    throw new Error('Événement complet, ajouté en liste d\'attente');
  }
  
  this.capacity.current += 1;
  return this.save();
};

// Méthode pour désinscrire un participant
eventSchema.methods.removeParticipant = function() {
  if (this.capacity.current > 0) {
    this.capacity.current -= 1;
    
    // Si il y a une liste d'attente, déplacer une personne
    if (this.capacity.waitingList > 0) {
      this.capacity.waitingList -= 1;
      this.capacity.current += 1;
    }
  }
  
  return this.save();
};

// Méthode pour valider l'événement
eventSchema.methods.validate = function(validatorId) {
  this.status = 'active';
  this.validatedBy = validatorId;
  this.validatedAt = new Date();
  return this.save();
};

// Méthode statique pour trouver les événements à venir
eventSchema.statics.findUpcoming = function(limit = 10) {
  const now = new Date();
  return this.find({
    status: 'active',
    'dates.startDate': { $gt: now }
  })
  .sort({ 'dates.startDate': 1 })
  .limit(limit);
};

// Méthode statique pour rechercher par proximité
eventSchema.statics.findNearby = function(longitude, latitude, maxDistance = 50000) {
  return this.find({
    'location.coordinates': {
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
eventSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Event', eventSchema);

