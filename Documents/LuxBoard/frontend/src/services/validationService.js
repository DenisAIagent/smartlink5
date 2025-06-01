class ValidationService {
  constructor() {
    this.rules = {
      required: (value) => ({
        isValid: value !== undefined && value !== null && value !== '',
        message: 'Ce champ est requis'
      }),
      email: (value) => ({
        isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'Format d\'email invalide'
      }),
      minLength: (min) => (value) => ({
        isValid: value.length >= min,
        message: `Minimum ${min} caractères requis`
      }),
      maxLength: (max) => (value) => ({
        isValid: value.length <= max,
        message: `Maximum ${max} caractères autorisés`
      }),
      pattern: (regex, message) => (value) => ({
        isValid: regex.test(value),
        message
      }),
      number: (value) => ({
        isValid: !isNaN(value) && typeof value === 'number',
        message: 'Valeur numérique requise'
      }),
      min: (min) => (value) => ({
        isValid: value >= min,
        message: `La valeur minimale est ${min}`
      }),
      max: (max) => (value) => ({
        isValid: value <= max,
        message: `La valeur maximale est ${max}`
      }),
      date: (value) => ({
        isValid: !isNaN(Date.parse(value)),
        message: 'Date invalide'
      }),
      phone: (value) => ({
        isValid: /^(\+33|0)[1-9](\d{2}){4}$/.test(value),
        message: 'Numéro de téléphone invalide'
      })
    };
  }

  // Valider un champ selon des règles spécifiques
  validateField(value, rules) {
    const errors = [];

    for (const rule of rules) {
      if (typeof rule === 'string') {
        const validation = this.rules[rule](value);
        if (!validation.isValid) {
          errors.push(validation.message);
        }
      } else if (typeof rule === 'function') {
        const validation = rule(value);
        if (!validation.isValid) {
          errors.push(validation.message);
        }
      } else if (typeof rule === 'object') {
        const { type, params } = rule;
        const validation = this.rules[type](params)(value);
        if (!validation.isValid) {
          errors.push(validation.message);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Valider un objet complet selon un schéma
  validateObject(data, schema) {
    const errors = {};
    let isValid = true;

    for (const [field, rules] of Object.entries(schema)) {
      const validation = this.validateField(data[field], rules);
      if (!validation.isValid) {
        errors[field] = validation.errors;
        isValid = false;
      }
    }

    return {
      isValid,
      errors
    };
  }

  // Schémas de validation prédéfinis
  schemas = {
    provider: {
      name: ['required', { type: 'minLength', params: 2 }, { type: 'maxLength', params: 100 }],
      description: ['required', { type: 'minLength', params: 10 }],
      category: ['required'],
      location: ['required'],
      contact: {
        email: ['required', 'email'],
        phone: ['phone'],
        website: [{ type: 'pattern', params: /^https?:\/\/.+\..+$/, message: 'URL invalide' }]
      },
      price: [{ type: 'number' }, { type: 'min', params: 0 }],
      rating: [{ type: 'number' }, { type: 'min', params: 0 }, { type: 'max', params: 5 }]
    },
    booking: {
      providerId: ['required'],
      startDate: ['required', 'date'],
      endDate: ['required', 'date'],
      customerInfo: {
        name: ['required'],
        email: ['required', 'email'],
        phone: ['phone']
      }
    },
    review: {
      rating: ['required', { type: 'number' }, { type: 'min', params: 1 }, { type: 'max', params: 5 }],
      comment: ['required', { type: 'minLength', params: 10 }]
    }
  };
}

export const validationService = new ValidationService(); 