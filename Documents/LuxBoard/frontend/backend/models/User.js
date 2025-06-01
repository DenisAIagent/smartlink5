const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const mongoosePaginate = require('mongoose-paginate-v2');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Format d\'email invalide']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
  },
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true,
    maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères']
  },
  lastName: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'editor', 'user'],
      message: 'Le rôle doit être admin, editor ou user'
    },
    default: 'user'
  },
  avatar: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  refreshToken: {
    type: String,
    default: null
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.refreshToken;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpires;
      return ret;
    }
  }
});

// Index pour optimiser les recherches
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Middleware pour hasher le mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  // Ne hasher que si le mot de passe a été modifié
  if (!this.isModified('password')) return next();
  
  try {
    // Hasher le mot de passe avec un salt de 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour obtenir le nom complet
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Méthode pour obtenir les initiales
userSchema.virtual('initials').get(function() {
  return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
});

// Méthode pour vérifier les permissions
userSchema.methods.hasPermission = function(requiredRole) {
  const roleHierarchy = {
    'user': 1,
    'editor': 2,
    'admin': 3
  };
  
  return roleHierarchy[this.role] >= roleHierarchy[requiredRole];
};

// Méthode pour mettre à jour la dernière connexion
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Ajouter le plugin de pagination
userSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('User', userSchema);

