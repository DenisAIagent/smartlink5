const express = require('express');
const router = express.Router();

const linkController = require('../controllers/linkController');
const { slugValidation, platformValidation } = require('../validators/linkValidators');

// Route pour la redirection et le tracking
router.get('/:slug/:platform', 
  slugValidation, 
  platformValidation, 
  linkController.redirectToPlatform
);

module.exports = router;

