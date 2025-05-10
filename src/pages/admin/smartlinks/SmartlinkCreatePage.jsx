// src/pages/admin/smartlinks/SmartlinkCreatePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Typography, Container, Box } from '@mui/material'; // Ajout de Container et Box pour la mise en page
import { toast } from 'react-toastify'; // Nous utiliserons toast directement dans SmartLinkForm, mais la page peut aussi l'utiliser si besoin.

// Import du composant formulaire SmartLink
import SmartLinkForm from '@/components/smartlinks/SmartLinkForm'; // Vérifiez bien ce chemin
// L'apiService est utilisé par SmartLinkForm, pas directement ici.

function SmartlinkCreatePage() {
  const navigate = useNavigate();

  // Callback exécuté après la création réussie du SmartLink (passé à SmartLinkForm)
  const handleCreateSuccess = (createdSmartlink) => {
    // La notification de succès est déjà gérée dans SmartLinkForm.
    // On pourrait ajouter une notification spécifique à la page si nécessaire.
    // toast.success(`SmartLink "${createdSmartlink.trackTitle}" créé avec succès ! Redirection...`);
    
    // Rediriger vers la liste des SmartLinks après un court délai pour que le toast soit visible
    setTimeout(() => {
      navigate('/admin/smartlinks'); // Ajustez si votre route pour la liste est différente
    }, 1500); // Délai de 1.5 secondes
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}> {/* Utilisation de Container pour un padding et une largeur max */}
      <Paper 
        elevation={3} // Un peu d'ombre pour la "carte"
        sx={{ 
          p: { xs: 2, md: 4 }, // Padding responsif
          borderRadius: 2 // Bords arrondis
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            mb: 3, 
            fontWeight: 'bold', 
            textAlign: 'center' // Centrer le titre
          }}
        >
          Créer un Nouveau SmartLink
        </Typography>
        
        {/* Le formulaire SmartLink est responsable de la logique de création et des notifications */}
        <SmartLinkForm onFormSubmitSuccess={handleCreateSuccess} />
        {/* smartLinkData n'est pas passé car c'est une création */}
      </Paper>
    </Container>
  );
}

export default SmartlinkCreatePage;
