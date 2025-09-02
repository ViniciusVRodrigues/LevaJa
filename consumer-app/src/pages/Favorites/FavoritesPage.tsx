import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const FavoritesPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Favoritos
      </Typography>
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Página de favoritos em desenvolvimento...
        </Typography>
      </Box>
    </Container>
  );
};

export default FavoritesPage;