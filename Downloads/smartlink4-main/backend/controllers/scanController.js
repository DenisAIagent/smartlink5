const { validationResult } = require('express-validator');
const scanService = require('../services/scanService');

const scanUrl = async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }
    
    const { url } = req.body;
    
    // Appeler le service de scan
    const result = await scanService.scanUrl(url);
    
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'URL not found on external service') {
      return res.status(404).json({
        error: 'Lien non trouvé. Veuillez vérifier l\'URL ou utiliser un ISRC/UPC valide.'
      });
    }
    
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
};

module.exports = {
  scanUrl
};

