import React from 'react';
import { Container, Typography, Box, Card, CardContent, Button } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Olá, {user?.name?.split(' ')[0] || 'Usuário'}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Descubra ofertas incríveis e ajude a reduzir o desperdício de alimentos
        </Typography>
      </Box>

      {/* Welcome Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Bem-vindo ao LevaJá! 🌱
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Sua plataforma para ofertas sustentáveis
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" href="/products">
              Ver Ofertas
            </Button>
            <Button variant="outlined" href="/map">
              Mercados Próximos
            </Button>
            <Button variant="outlined" href="/sustainability">
              Meu Impacto
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
        <Card sx={{ textAlign: 'center', bgcolor: 'success.main', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold">
              45.6kg
            </Typography>
            <Typography variant="body2">
              Alimentos salvos
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ textAlign: 'center', bgcolor: 'warning.main', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold">
              R$ 234
            </Typography>
            <Typography variant="body2">
              Economizado
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ textAlign: 'center', bgcolor: 'info.main', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold">
              24
            </Typography>
            <Typography variant="body2">
              Ofertas hoje
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ textAlign: 'center', bgcolor: 'secondary.main', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold">
              3
            </Typography>
            <Typography variant="body2">
              Mercados próximos
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Quick Actions */}
      <Box>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Acesso Rápido
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            sx={{ py: 2, flexDirection: 'column', gap: 1 }}
            href="/products"
          >
            <Typography variant="body2">
              Ofertas
            </Typography>
          </Button>
          <Button
            variant="outlined"
            fullWidth
            sx={{ py: 2, flexDirection: 'column', gap: 1 }}
            href="/map"
          >
            <Typography variant="body2">
              Mercados
            </Typography>
          </Button>
          <Button
            variant="outlined"
            fullWidth
            sx={{ py: 2, flexDirection: 'column', gap: 1 }}
            href="/sustainability"
          >
            <Typography variant="body2">
              Impacto
            </Typography>
          </Button>
          <Button
            variant="outlined"
            fullWidth
            sx={{ py: 2, flexDirection: 'column', gap: 1 }}
            href="/favorites"
          >
            <Typography variant="body2">
              Favoritos
            </Typography>
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage;