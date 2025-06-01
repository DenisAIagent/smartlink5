const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre de l\'offre est requis'],
    trim: true,
    maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true,
    maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères']
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: [true, 'Le prestataire est requis']
  },
  type: {
    type: String,
    enum: {
      values: ['discount', 'exclusive', 'upgrade', 'gift', 'experience'],
      message: 'Type d\'offre invalide'
    },
    required: [true, 'Le type d\'offre est requis']
  },
  value: {
    type: {
      type: String,
      enum: ['percentage', 'fixed', 'upgrade', 'gift'],
      required: true
    },
    amount: {
      type: Number,
      min: [0, 'La valeur ne peut pas être négative']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'La description de la valeur ne peut pas dépasser 200 caractères']
    }
  },
  validFrom: {
    type: Date,
    required: [true, 'La date de début est requise'],
    validate: {
      validator: function(value) {
        return value <= this.validUntil;
      },
      message: 'La date de début doit être antérieure à la date de fin'
    }
  },
  validUntil: {
    type: Date,
    required: [true, 'La date de fin est requise'],
    validate: {
      validator: function(value) {
        return value >= this.validFrom;
      },
      message: 'La date de fin doit être postérieure à la date de début'
    }
  },
  conditions: {
    type: String,
    trim: true,
    maxlength: [1000, 'Les conditions ne peuvent pas dépasser 1000 caractères']
  },
  contactInfo: {
    type: String,
    trim: true,
    maxlength: [500, 'Les informations de contact ne peuvent pas dépasser 500 caractères']
  },
  url: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Format d\'URL invalide']
  },
  code: {
    type: String,
    trim: true,
    uppercase: true,
    maxlength: [50, 'Le code ne peut pas dépasser 50 caractères']
  },
  maxUses: {
    type: Number,
    min: [0, 'Le nombre maximum d\'utilisations ne peut pas être négatif'],
    default: null // null = illimité
  },
  currentUses: {
    type: Number,
    min: [0, 'Le nombre d\'utilisations actuelles ne peut pas être négatif'],
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isExclusive: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [50, 'Un tag ne peut pas dépasser 50 caractères']
  }],
  image: {
    url: String,
    alt: String
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
offerSchema.index({ title: 'text', description: 'text', tags: 'text' });
offerSchema.index({ provider: 1 });
offerSchema.index({ type: 1 });
offerSchema.index({ validFrom: 1, validUntil: 1 });
offerSchema.index({ isActive: 1, validUntil: 1 });
offerSchema.index({ featured: -1, createdAt: -1 });

// Virtual pour vérifier si l'offre est valide
offerSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.isActive && 
         this.validFrom <= now && 
         this.validUntil >= now &&
         (this.maxUses === null || this.currentUses < this.maxUses);
});

// Virtual pour vérifier si l'offre expire bientôt (dans les 7 jours)
offerSchema.virtual('expiresSoon').get(function() {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
  return this.validUntil <= sevenDaysFromNow && this.validUntil >= now;
});

// Virtual pour le statut de l'offre
offerSchema.virtual('status').get(function() {
  const now = new Date();
  
  if (!this.isActive) return 'inactive';
  if (this.validFrom > now) return 'upcoming';
  if (this.validUntil < now) return 'expired';
  if (this.maxUses && this.currentUses >= this.maxUses) return 'exhausted';
  if (this.expiresSoon) return 'expires_soon';
  
  return 'active';
});

// Virtual pour le pourcentage d'utilisation
offerSchema.virtual('usagePercentage').get(function() {
  if (!this.maxUses) return 0;
  return Math.round((this.currentUses / this.maxUses) * 100);
});

// Méthode pour utiliser l'offre
offerSchema.methods.use = function() {
  if (!this.isValid) {
    throw new Error('Cette offre n\'est plus valide');
  }
  
  if (this.maxUses && this.currentUses >= this.maxUses) {
    throw new Error('Cette offre a atteint son nombre maximum d\'utilisations');
  }
  
  this.currentUses += 1;
  return this.save();
};

// Méthode pour valider l'offre
offerSchema.methods.validate = function(validatorId) {
  this.validatedBy = validatorId;
  this.validatedAt = new Date();
  return this.save();
};

// Méthode statique pour trouver les offres actives
offerSchema.statics.findActive = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now },
    $or: [
      { maxUses: null },
      { $expr: { $lt: ['$currentUses', '$maxUses'] } }
    ]
  }).populate('provider');
};

// Méthode statique pour trouver les offres qui expirent bientôt
offerSchema.statics.findExpiringSoon = function(days = 7) {
  const now = new Date();
  const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
  
  return this.find({
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now, $lte: futureDate }
  }).populate('provider');
};

// Ajouter le plugin de pagination
offerSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Offer', offerSchema);

