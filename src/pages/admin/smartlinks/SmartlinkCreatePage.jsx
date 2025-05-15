import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import SmartLinkWizard from '../../../features/admin/smartlinks/components/SmartLinkWizard';

const SmartlinkCreatePage = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Créer un Nouveau SmartLink
        </Typography>
        <SmartLinkWizard />
      </Box>
    </Container>
  );
};

export default SmartlinkCreatePage;
