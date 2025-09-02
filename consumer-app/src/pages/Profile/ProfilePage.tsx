import React from 'react';
import { Container, Typography, Box, Card, CardContent, Button, Avatar } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { Logout, Edit, Settings } from '@mui/icons-material';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Meu Perfil
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            <Avatar 
              src={user?.avatar} 
              sx={{ width: 80, height: 80 }}
            >
              {user?.name?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {user?.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {user?.email}
              </Typography>
              <Typography variant="body2" color="primary">
                {user?.loyaltyPoints} pontos de fidelidade
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="outlined" 
              startIcon={<Edit />}
            >
              Editar Perfil
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<Settings />}
            >
              Configurações
            </Button>
            <Button 
              variant="outlined" 
              color="error"
              startIcon={<Logout />}
              onClick={handleLogout}
            >
              Sair
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Estatísticas de Sustentabilidade
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Score: {user?.sustainabilityScore}/100
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProfilePage;