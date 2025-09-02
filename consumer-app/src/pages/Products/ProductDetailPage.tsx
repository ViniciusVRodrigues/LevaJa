import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const ProductDetailPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Detalhes do Produto
      </Typography>
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Página de detalhes do produto em desenvolvimento...
        </Typography>
      </Box>
    </Container>
  );
};

export default ProductDetailPage;