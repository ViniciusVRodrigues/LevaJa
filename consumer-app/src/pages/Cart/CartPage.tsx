import React from 'react';
import { Container, Typography, Box, Card, CardContent, Button } from '@mui/material';
import { useCart } from '../../contexts/CartContext';
import { ShoppingCartOutlined } from '@mui/icons-material';

const CartPage: React.FC = () => {
  const { cart } = useCart();

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Carrinho de Compras
      </Typography>
      
      {cart.items.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <ShoppingCartOutlined sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Seu carrinho está vazio
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Adicione produtos incríveis com desconto!
            </Typography>
            <Button variant="contained" href="/products">
              Ver Produtos
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box>
          <Typography variant="body1">
            {cart.itemCount} itens no carrinho
          </Typography>
          <Typography variant="h6" color="primary">
            Total: R$ {cart.total.toFixed(2)}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default CartPage;