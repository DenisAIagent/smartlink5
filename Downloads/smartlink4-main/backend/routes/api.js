const express = require('express');
const router = express.Router();

const scanController = require('../controllers/scanController');
const linkController = require('../controllers/linkController');
const { 
  scanValidation, 
  createLinkValidation, 
  slugValidation, 
  platformValidation 
} = require('../validators/linkValidators');

// Route pour scanner une URL
router.post('/scan', scanValidation, scanController.scanUrl);

// Routes pour les liens
router.post('/links', createLinkValidation, linkController.createLink);
router.get('/links', linkController.getAllLinks);
router.get('/links/:slug', slugValidation, linkController.getLinkBySlug);
router.get('/links/:slug/availability', slugValidation, linkController.checkSlugAvailability);

module.exports = router;

