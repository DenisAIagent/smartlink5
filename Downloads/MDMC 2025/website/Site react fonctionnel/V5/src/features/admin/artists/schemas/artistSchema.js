// Schema de validation pour les artistes
export const artistSchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZÀ-ÿ0-9\s\-\_\.]+$/,
    errorMessages: {
      required: 'Le nom de l\'artiste est requis',
      minLength: 'Le nom doit contenir au moins 2 caractères',
      maxLength: 'Le nom ne peut pas dépasser 100 caractères',
      pattern: 'Le nom contient des caractères non autorisés'
    }
  },
  
  genre: {
    required: false,
    enum: ['pop', 'rock', 'hip-hop', 'electronic', 'jazz', 'classical', 'r&b', 'country', 'reggae', 'other'],
    errorMessages: {
      enum: 'Genre musical non valide'
    }
  },
  
  bio: {
    required: false,
    maxLength: 2000,
    errorMessages: {
      maxLength: 'La biographie ne peut pas dépasser 2000 caractères'
    }
  },
  
  socialLinks: {
    required: false,
    type: 'object',
    properties: {
      website: {
        pattern: /^https?:\/\/.+/,
        errorMessages: {
          pattern: 'L\'URL du site web n\'est pas valide'
        }
      },
      instagram: {
        pattern: /^https?:\/\/(www\.)?instagram\.com\/.+/,
        errorMessages: {
          pattern: 'L\'URL Instagram n\'est pas valide'
        }
      },
      twitter: {
        pattern: /^https?:\/\/(www\.)?twitter\.com\/.+/,
        errorMessages: {
          pattern: 'L\'URL Twitter n\'est pas valide'
        }
      },
      facebook: {
        pattern: /^https?:\/\/(www\.)?facebook\.com\/.+/,
        errorMessages: {
          pattern: 'L\'URL Facebook n\'est pas valide'
        }
      }
    }
  },
  
  profileImage: {
    required: false,
    type: 'string',
    pattern: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i,
    errorMessages: {
      pattern: 'L\'URL de l\'image doit être une image valide (jpg, png, gif, webp)'
    }
  }
};

// Fonction de validation
export const validateArtist = (data) => {
  const errors = {};
  
  // Validation du nom
  if (!data.name || !data.name.trim()) {
    errors.name = artistSchema.name.errorMessages.required;
  } else {
    if (data.name.length < artistSchema.name.minLength) {
      errors.name = artistSchema.name.errorMessages.minLength;
    }
    if (data.name.length > artistSchema.name.maxLength) {
      errors.name = artistSchema.name.errorMessages.maxLength;
    }
    if (!artistSchema.name.pattern.test(data.name)) {
      errors.name = artistSchema.name.errorMessages.pattern;
    }
  }
  
  // Validation du genre
  if (data.genre && !artistSchema.genre.enum.includes(data.genre)) {
    errors.genre = artistSchema.genre.errorMessages.enum;
  }
  
  // Validation de la bio
  if (data.bio && data.bio.length > artistSchema.bio.maxLength) {
    errors.bio = artistSchema.bio.errorMessages.maxLength;
  }
  
  // Validation des liens sociaux
  if (data.socialLinks) {
    const socialErrors = {};
    Object.keys(artistSchema.socialLinks.properties).forEach(platform => {
      if (data.socialLinks[platform]) {
        const pattern = artistSchema.socialLinks.properties[platform].pattern;
        if (!pattern.test(data.socialLinks[platform])) {
          socialErrors[platform] = artistSchema.socialLinks.properties[platform].errorMessages.pattern;
        }
      }
    });
    
    if (Object.keys(socialErrors).length > 0) {
      errors.socialLinks = socialErrors;
    }
  }
  
  // Validation de l'image de profil
  if (data.profileImage && !artistSchema.profileImage.pattern.test(data.profileImage)) {
    errors.profileImage = artistSchema.profileImage.errorMessages.pattern;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default artistSchema; 