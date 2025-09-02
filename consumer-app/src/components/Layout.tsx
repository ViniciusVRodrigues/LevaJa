import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { 
  Home, 
  Search, 
  ShoppingCart, 
  Person,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Badge } from '@mui/material';
import { useCart } from '../contexts/CartContext';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useCart();

  const [value, setValue] = React.useState(() => {
    const path = location.pathname;
    if (path === '/') return 0;
    if (path.startsWith('/products')) return 1;
    if (path === '/cart') return 2;
    if (path === '/profile') return 3;
    return 0;
  });

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    
    switch (newValue) {
      case 0:
        navigate('/');
        break;
      case 1:
        navigate('/products');
        break;
      case 2:
        navigate('/cart');
        break;
      case 3:
        navigate('/profile');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      pb: { xs: 8, sm: 0 } // Add bottom padding on mobile for navigation
    }}>
      {/* Main content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </Box>

      {/* Bottom Navigation - Mobile only */}
      <BottomNavigation
        value={value}
        onChange={handleChange}
        showLabels
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          display: { xs: 'flex', sm: 'none' },
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <BottomNavigationAction
          label="Início"
          icon={<Home />}
        />
        <BottomNavigationAction
          label="Produtos"
          icon={<Search />}
        />
        <BottomNavigationAction
          label="Carrinho"
          icon={
            <Badge 
              badgeContent={cart.itemCount > 0 ? cart.itemCount : null} 
              color="secondary"
            >
              <ShoppingCart />
            </Badge>
          }
        />
        <BottomNavigationAction
          label="Perfil"
          icon={<Person />}
        />
      </BottomNavigation>

      {/* Desktop Navigation - Hidden on mobile */}
      <Box 
        sx={{ 
          display: { xs: 'none', sm: 'flex' },
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          px: 2,
          py: 1,
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        {/* Logo */}
        <Box sx={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'primary.main' }}>
          LevaJá
        </Box>

        {/* Navigation buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box
            onClick={() => navigate('/')}
            sx={{ cursor: 'pointer', px: 2, py: 1, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
          >
            Início
          </Box>
          <Box
            onClick={() => navigate('/products')}
            sx={{ cursor: 'pointer', px: 2, py: 1, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
          >
            Produtos
          </Box>
          <Box
            onClick={() => navigate('/favorites')}
            sx={{ cursor: 'pointer', px: 2, py: 1, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
          >
            Favoritos
          </Box>
          <Box
            onClick={() => navigate('/map')}
            sx={{ cursor: 'pointer', px: 2, py: 1, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
          >
            Mercados
          </Box>
          <Box
            onClick={() => navigate('/sustainability')}
            sx={{ cursor: 'pointer', px: 2, py: 1, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
          >
            Sustentabilidade
          </Box>
          <Badge 
            badgeContent={cart.itemCount > 0 ? cart.itemCount : null} 
            color="secondary"
          >
            <Box
              onClick={() => navigate('/cart')}
              sx={{ cursor: 'pointer', px: 2, py: 1, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
            >
              Carrinho
            </Box>
          </Badge>
          <Box
            onClick={() => navigate('/profile')}
            sx={{ cursor: 'pointer', px: 2, py: 1, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
          >
            Perfil
          </Box>
        </Box>
      </Box>

      {/* Add top padding for desktop navigation */}
      <Box sx={{ display: { xs: 'none', sm: 'block' }, height: 64 }} />
    </Box>
  );
};

export default Layout;