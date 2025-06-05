import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Avatar } from '@mui/material';

const reviews = [
  {
    name: 'Jean Dupont',
    role: 'Directeur Marketing',
    company: 'Entreprise A',
    content: 'MDMCV4 a révolutionné notre façon de gérer les paramètres et les rapports. L\'interface est intuitive et les fonctionnalités sont puissantes.',
    avatar: '👨‍💼'
  },
  {
    name: 'Marie Martin',
    role: 'Responsable Intégrations',
    company: 'Entreprise B',
    content: 'Les intégrations sont fluides et la synchronisation des données est impeccable. Un vrai gain de temps pour notre équipe.',
    avatar: '👩‍💼'
  },
  {
    name: 'Pierre Durand',
    role: 'Analyste de Données',
    company: 'Entreprise C',
    content: 'Les rapports sont détaillés et personnalisables. J\'apprécie particulièrement la possibilité d\'exporter les données dans différents formats.',
    avatar: '👨‍🔬'
  }
];

const Reviews = () => {
  return (
    <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" component="h2" align="center" gutterBottom>
          Ce que disent nos utilisateurs
        </Typography>
        <Typography variant="h5" align="center" color="text.secondary" paragraph>
          Découvrez les retours d'expérience de nos clients
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {reviews.map((review, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, fontSize: '2rem' }}>{review.avatar}</Avatar>
                    <Box>
                      <Typography variant="h6" component="div">
                        {review.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {review.role} - {review.company}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1" color="text.primary">
                    "{review.content}"
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Reviews; 