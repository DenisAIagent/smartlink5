const { body, param } = require('express-validator');

const scanValidation = [
  body('url')
    .isURL()
    .withMessage('URL invalide')
    .notEmpty()
    .withMessage('URL requise')
];

const createLinkValidation = [
  body('artist')
    .trim()
    .notEmpty()
    .withMessage('Le nom de l\'artiste est requis')
    .isLength({ min: 1, max: 100 })
    .withMessage('Le nom de l\'artiste doit contenir entre 1 et 100 caractères'),
    
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Le titre est requis')
    .isLength({ min: 1, max: 100 })
    .withMessage('Le titre doit contenir entre 1 et 100 caractères'),
    
  body('slug')
    .trim()
    .notEmpty()
    .withMessage('Le slug est requis')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Le slug contient des caractères invalides. Utilisez uniquement des lettres minuscules, des chiffres et des tirets.'),
    
  body('coverUrl')
    .isURL()
    .withMessage('URL de couverture invalide'),
    
  body('streamingLinks')
    .isObject()
    .withMessage('Les liens de streaming doivent être un objet'),
    
  body('gtmId')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!value || value.trim() === '') return true;
      return /^GTM-[A-Z0-9]+$/.test(value.trim());
    })
    .withMessage('Format GTM-XXXXXXX attendu pour GTM ID'),
    
  body('ga4Id')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!value || value.trim() === '') return true;
      return /^G-[A-Z0-9]+$/.test(value.trim());
    })
    .withMessage('Format G-XXXXXXX attendu pour GA4 ID'),
    
  body('googleAdsId')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!value || value.trim() === '') return true;
      return /^AW-[0-9]+$/.test(value.trim());
    })
    .withMessage('Format AW-XXXXXXX attendu pour Google Ads ID')
];

const slugValidation = [
  param('slug')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug invalide')
];

const platformValidation = [
  param('platform')
    .isIn(['spotify', 'appleMusic', 'youtube', 'deezer', 'amazonMusic', 'tidal'])
    .withMessage('Plateforme non supportée')
];

module.exports = {
  scanValidation,
  createLinkValidation,
  slugValidation,
  platformValidation
};

