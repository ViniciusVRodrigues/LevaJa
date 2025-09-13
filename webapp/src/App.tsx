import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import { useAuth } from './hooks';

// Login Component (Simple for demo)
const Login: React.FC = () => {
  const { login } = useAuth();
  
  const handleLogin = async () => {
    await login('joao.silva@levaja.com', 'demo123');
    // Redirect to dashboard after login
    window.location.href = '/';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'background.default',
        p: 2,
        position: 'relative',
        width: '100vw',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 4,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          textAlign: 'center',
          maxWidth: 400,
          width: '100%',
          mx: 'auto',
        }}
      >
        {/* Logo */}
        <Box sx={{ mb: 3 }}>
          <img 
            src="/levaja.png" 
            alt="LevaJá Logo" 
            style={{
              maxWidth: '240px',
              display: 'block',
            }} 
          />
        </Box>
      
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          Clique para fazer login com usuário demo
        </Typography>
        <Box sx={{ mb: 3 }}>
          <button 
            onClick={handleLogin} 
            style={{ 
              padding: '12px 24px', 
              fontSize: '16px',
              backgroundColor: '#F36F21',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
              textTransform: 'none',
              transition: 'background-color 0.2s',
              width: '100%',
              maxWidth: '200px',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c44810'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F36F21'}
          >
            Login Demo (admin)
          </button>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
          Email: joao.silva@levaja.com<br />
          Senha: demo123
        </Typography>
      </Box>
    </Box>
  );
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="produtos" element={<div>Produtos (Em desenvolvimento)</div>} />
        <Route path="funcionarios" element={<div>Funcionários (Em desenvolvimento)</div>} />
        <Route path="setores" element={<div>Setores (Em desenvolvimento)</div>} />
        <Route path="promocoes" element={<div>Promoções (Em desenvolvimento)</div>} />
        <Route path="promocoes/sugestoes" element={<div>Sugestões (Em desenvolvimento)</div>} />
        <Route path="relatorios/*" element={<div>Relatórios (Em desenvolvimento)</div>} />
        <Route path="notificacoes" element={<div>Notificações (Em desenvolvimento)</div>} />
        <Route path="configuracoes" element={<div>Configurações (Em desenvolvimento)</div>} />
      </Route>
    </Routes>
  );
}

export default App;
