import React from 'react';
import { Box, Container, Grid, Typography, Card, CardContent } from '@mui/material';

const services = [
  {
    title: 'Gestion des Paramètres',
    description: 'Configurez facilement tous les paramètres de votre application pour une expérience personnalisée.',
    icon: '⚙️'
  },
  {
    title: 'Rapports Avancés',
    description: 'Générez des rapports détaillés et personnalisés pour suivre vos performances.',
    icon: '📊'
  },
  {
    title: 'Intégrations',
    description: 'Connectez votre application avec d\'autres plateformes pour une meilleure productivité.',
    icon: '🔌'
  }
];

const Services = () => {
  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" component="h2" align="center" gutterBottom>
          Nos Services
        </Typography>
        <Typography variant="h5" align="center" color="text.secondary" paragraph>
          Découvrez comment nous pouvons vous aider à optimiser votre gestion
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {services.map((service, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Typography variant="h1" component="div" sx={{ mb: 2 }}>
                    {service.icon}
                  </Typography>
                  <Typography gutterBottom variant="h5" component="h3">
                    {service.title}
                  </Typography>
                  <Typography>
                    {service.description}
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

export default Services; 