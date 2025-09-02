import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const SustainabilityPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Sustentabilidade
      </Typography>
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Dashboard de sustentabilidade em desenvolvimento...
        </Typography>
      </Box>
    </Container>
  );
};

export default SustainabilityPage;