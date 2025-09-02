import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const OrdersPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Meus Pedidos
      </Typography>
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Página de pedidos em desenvolvimento...
        </Typography>
      </Box>
    </Container>
  );
};

export default OrdersPage;