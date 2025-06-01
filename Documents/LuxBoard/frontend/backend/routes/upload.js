const express = require('express');
const path = require('path');
const router = express.Router();
const { upload, handleUploadError, deleteFile, getFileUrl } = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');

// Route pour uploader une seule image
router.post('/single', authenticate, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    const fileUrl = getFileUrl(req.file.filename, req);

    res.json({
      success: true,
      message: 'Image uploadée avec succès',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'upload'
    });
  }
});

// Route pour uploader plusieurs images
router.post('/multiple', authenticate, upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: getFileUrl(file.filename, req)
    }));

    res.json({
      success: true,
      message: `${req.files.length} image(s) uploadée(s) avec succès`,
      data: uploadedFiles
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload multiple:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'upload'
    });
  }
});

// Route pour supprimer une image
router.delete('/:filename', authenticate, (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename);
    
    const deleted = deleteFile(filePath);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Image supprimée avec succès'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Fichier non trouvé'
      });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression'
    });
  }
});

// Middleware de gestion des erreurs d'upload
router.use(handleUploadError);

module.exports = router;

