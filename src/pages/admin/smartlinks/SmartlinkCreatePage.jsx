import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import SmartLinkWizard from '../../../features/admin/smartlinks/components/SmartLinkWizard';
import AdminLayout from '../../../components/layouts/AdminLayout';

const SmartlinkCreatePage = () => {
  return (
    <AdminLayout>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Créer un Nouveau SmartLink
          </Typography>
          <SmartLinkWizard />
        </Box>
      </Container>
    </AdminLayout>
  );
};

export default SmartlinkCreatePage;
